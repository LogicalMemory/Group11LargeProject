const jwtHelper = require('../../createJWT.js');

const normalizeEventId = (eventId) => {
  if (eventId === undefined || eventId === null) return null;
  const numeric = Number(eventId);
  if (!Number.isNaN(numeric)) return numeric;
  return eventId;
};

// export helper for unit tests
exports.normalizeEventId = normalizeEventId;

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res) => {
    try {
      const { token, eventId, commentText } = req.body;

      if (!token || !commentText || commentText.trim().length === 0 || eventId === undefined || eventId === null || eventId === '') {
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
      const usersCollection = db.collection('Users');

      const queryEventId = normalizeEventId(eventId);

      let profileImageUrl = null;
      try {
        const userDoc = await usersCollection.findOne({ UserId: user.userId });
        profileImageUrl = userDoc?.ProfileImageUrl || null;
      } catch (lookupErr) {
        console.error('Unable to lookup user profile image', lookupErr);
      }

      const newComment = {
        CommentId: Date.now(),
        AuthorId: user.userId,
        AuthorName: `${user.firstName ?? 'LoopU'} ${user.lastName ?? ''}`.trim(),
        AuthorImageUrl: profileImageUrl,
        Text: commentText.trim(),
        CreatedAt: new Date().toISOString(),
      };

      const updatedEvent = await events.findOneAndUpdate(
        { EventId: queryEventId },
        {
          $push: { Comments: newComment },
        },
        { returnDocument: 'after' },
      );

      let eventPayload = updatedEvent?.value;

      if (!eventPayload) {
        eventPayload = await events.findOne({ EventId: queryEventId });
        if (!eventPayload) {
          const refreshedToken = jwtHelper.refresh(token);
          return res.status(404).json({ error: 'Event not found', token: refreshedToken });
        }
      }

      const refreshedToken = jwtHelper.refresh(token);

      res.status(200).json({
        token: refreshedToken,
        eventObject: eventPayload,
        comment: newComment,
      });
    } catch (err) {
      console.error('Error in /api/addComment:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};
