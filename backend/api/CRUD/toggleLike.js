const jwtHelper = require('../../createJWT.js');

const normalizeEventId = (eventId) => {
  if (eventId === undefined || eventId === null) return null;
  const numeric = Number(eventId);
  if (!Number.isNaN(numeric)) return numeric;
  return eventId;
};

// export helper for tests
exports.normalizeEventId = normalizeEventId;

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res) => {
    try {
      const { token, eventId } = req.body;

      if (!token || eventId === undefined || eventId === null || eventId === '') {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(200).json({ error: 'The JWT is no longer valid', token: '' });
      }

      const user = jwtHelper.getUserFromToken(token);
      if (!user?.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const db = client.db('COP4331Cards');
      const events = db.collection('Events');

      const queryEventId = normalizeEventId(eventId);

      const targetEvent = await events.findOne({ EventId: queryEventId });
      if (!targetEvent) {
        const refreshedToken = jwtHelper.refresh(token);
        return res.status(404).json({ error: 'Event not found', token: refreshedToken });
      }

      const likedBySet = new Set(targetEvent.LikedBy || []);
      let likes = targetEvent.Likes || 0;
      let liked;

      if (likedBySet.has(user.userId)) {
        likedBySet.delete(user.userId);
        likes = Math.max(0, likes - 1);
        liked = false;
      } else {
        likedBySet.add(user.userId);
        likes += 1;
        liked = true;
      }

      const update = {
        $set: {
          LikedBy: Array.from(likedBySet),
          Likes: likes,
        },
      };

      const updatedEvent = await events.findOneAndUpdate(
        { EventId: queryEventId },
        update,
        { returnDocument: 'after' },
      );

      const refreshedToken = jwtHelper.refresh(token);

      return res.status(200).json({
        token: refreshedToken,
        liked,
        likes,
        eventObject: updatedEvent.value,
      });
    } catch (err) {
      console.error('Error in /api/toggleLike:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};
