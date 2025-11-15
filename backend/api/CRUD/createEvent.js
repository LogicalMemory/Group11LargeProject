const jwtHelper = require('../../createJWT.js');

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    try {
      // incoming: token, eventTitle, eventDescription, eventTime, eventDuration, EventLocation
      // outgoing: token, eventObject OR error
      const { token, eventTitle, eventDescription, eventTime, eventDuration, eventLocation, eventImageUrl} = req.body;

      if (!token || !eventTitle || !eventDescription || !eventTime || !eventDuration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(200).json({ error: "The JWT is no longer valid", token: "" });
      }

      const db = client.db("COP4331Cards");
      const events = db.collection('Events');
      const users = db.collection('Users');

      const lastEvent = await events.find().sort({ EventId: -1 }).limit(1).toArray();
      const nextId = lastEvent.length > 0 ? lastEvent[0].EventId + 1 : 1;

      const userId = jwtHelper.getUserFromToken(token).userId;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const ownerDoc = await users.findOne({ UserId: userId });
      const ownerImageUrl = ownerDoc?.ProfileImageUrl || null;

      const newEvent = {
        EventId: nextId,
        EventOwnerId: userId,
        EventTitle: eventTitle,
        EventDescription: eventDescription,
        EventTime: eventTime,
        EventDuration: eventDuration,
        EventLocation: eventLocation,
        EventImageUrl: eventImageUrl || null,
        OwnerProfileImageUrl: ownerImageUrl
      };

      await events.insertOne(newEvent);

      var refreshedToken = jwtHelper.refresh(token);

      res.status(200).json({ token: refreshedToken, eventObject: newEvent });

    } catch (err) {
      console.error("Error in /api/createEvent:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
};
