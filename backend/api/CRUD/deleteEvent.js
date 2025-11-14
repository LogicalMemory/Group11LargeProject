const jwtHelper = require('../../createJWT.js');

exports.setApp = function (app, client, api_path) {
	app.post(api_path, async (req, res, next) => {
		try {
			// incoming: token, eventId
			// outgoing: token OR error
			const { token, eventId } = req.body;

			if (!token || (eventId === undefined || eventId === null || eventId === "")) {
				return res.status(400).json({ error: 'Missing required fields' });
			}

			if (jwtHelper.isExpired(token)) {
				return res.status(200).json({ error: "The JWT is no longer valid", token: "" });
			}

			const db = client.db("COP4331Cards");
			const events = db.collection('Events');

			const userId = jwtHelper.getUserFromToken(token).userId;

			if (!userId) {
				return res.status(401).json({ error: 'Invalid token' });
			}

			// Coerce EventId to number if possible (createEvent stores numeric EventId)
			const numericEventId = Number(eventId);
			const queryEventId = isNaN(numericEventId) ? eventId : numericEventId;

			// Only allow owner to delete their event
			const filter = { EventId: queryEventId, EventOwnerId: userId };

					const deleted = await events.findOneAndDelete(filter);

					const refreshedToken = jwtHelper.refresh(token);

					// `findOneAndDelete` returns an object with a `value` property containing the deleted doc,
					// or `null` if nothing matched. Check `deleted.value` instead of the wrapper object.
					if (!deleted || !deleted.value) {
						return res.status(404).json({ error: 'Event not found or not owned by user', token: refreshedToken });
					}

					// return the deleted event object along with refreshed token
					return res.status(200).json({ token: refreshedToken, eventObject: deleted.value });
		} catch (err) {
			console.error("Error in /api/deleteEvent:", err);
			res.status(500).json({ error: "Server error" });
		}
	});
};