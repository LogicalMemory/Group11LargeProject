const jwtHelper = require("../../createJWT.js");

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    try {
  // incoming:
  //   - token (required): JWT access token
  //   - searchKeyword (optional): string to match (partial, case-insensitive) against
  //       EventTitle, EventDescription, and EventLocation
  //   - ownerId (optional): filter results to a specific EventOwnerId (numeric or string)
  //   - pagination (optional): either `limit` & `skip` OR `page` & `pageSize`
  // outgoing: { events: Array, totalCount: Number, limit: Number, skip: Number, token: String } OR { error }

      const { searchKeyword, token, ownerId, limit, skip, page, pageSize } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(200).json({ error: "The JWT is no longer valid", token: "" });
      }

      const db = client.db("COP4331Cards");
      const events = db.collection('Events');

      let query = {};

  // Keyword search (case-insensitive) across EventTitle, EventDescription, and EventLocation.
  // The incoming keyword is escaped before building the RegExp to avoid accidental regex injection.
      if (searchKeyword !== undefined && searchKeyword !== null && String(searchKeyword).trim() !== "") {
        const kw = String(searchKeyword).trim();
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [
          { EventTitle: { $regex: regex } },
          { EventDescription: { $regex: regex } },
          { EventLocation: { $regex: regex } }
        ];
      }

  // Optional filter by ownerId. Try numeric coercion then fall back to string. The filter is
  // combined with the keyword query using $and if both are present.
      if (ownerId !== undefined && ownerId !== null && String(ownerId).trim() !== "") {
        const numericOwner = Number(ownerId);
        const ownerQuery = isNaN(numericOwner) ? String(ownerId) : numericOwner;
        query = Object.keys(query).length === 0 ? { EventOwnerId: ownerQuery } : { $and: [query, { EventOwnerId: ownerQuery }] };
      }

  // Pagination: accept either `limit` & `skip` OR `page` & `pageSize`.
  // Defaults: limit=50, skip=0. `limit` is capped at MAX_LIMIT to prevent large responses.
      let lim = 50;
      let sk = 0;
      if (page !== undefined && pageSize !== undefined) {
        const p = parseInt(page, 10);
        const ps = parseInt(pageSize, 10);
        if (!isNaN(p) && p > 0 && !isNaN(ps) && ps > 0) {
          sk = (p - 1) * ps;
          lim = ps;
        }
      } else {
        const parsedLimit = parseInt(limit, 10);
        const parsedSkip = parseInt(skip, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) lim = parsedLimit;
        if (!isNaN(parsedSkip) && parsedSkip >= 0) sk = parsedSkip;
      }
      // Cap the limit to prevent large responses
      const MAX_LIMIT = 100;
      if (lim > MAX_LIMIT) lim = MAX_LIMIT;

      const cursor = events.find(query).skip(sk).limit(lim);
      const found_events = await cursor.toArray();
      const totalCount = await events.countDocuments(query);

      const refreshedToken = jwtHelper.refresh(token);

      return res.status(200).json({ events: found_events, totalCount: totalCount, limit: lim, skip: sk, token: refreshedToken });
    } catch (err) {
      console.error("Error in /api/searchEvents:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
};
