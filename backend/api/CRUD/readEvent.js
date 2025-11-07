const jwtHelper = require("../../createJWT.js");

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    try {
      // incoming: eventId, token
      // outgoing: eventObject, token OR error

      const { eventId, token } = req.body;

      if (!token || (eventId === undefined || eventId === null || eventId === "")) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(200).json({ error: "The JWT is no longer valid", token: "" });
      }

      const db = client.db("COP4331Cards");
      const events = db.collection('Events');

      // EventId is stored as a number in createEvent.js (EventId: nextId)
      // Convert incoming eventId to a number so the query matches.
      const numericEventId = Number(eventId);

      const query = isNaN(numericEventId) ? { EventId: eventId } : { EventId: numericEventId };

      const found_event = await events.findOne(query);

      const refreshedToken = jwtHelper.refresh(token);

      if (!found_event) {
        return res.status(404).json({ error: 'Event not found', token: refreshedToken });
      }

      const ret = { eventObject: found_event, token: refreshedToken };
      res.status(200).json(ret);
    } catch (err) {
      console.error("Error in /api/readEvent:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
};
