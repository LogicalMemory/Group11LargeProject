const jwtHelper = require('../../createJWT.js');

exports.setApp = function (app, client, api_path) {
	app.post(api_path, async (req, res, next) => {
		try {
			// incoming: token, eventId, optional fields to update
			// outgoing: token, eventObject OR error
			const { token, eventId, eventTitle, eventDescription, eventTime, eventDuration, eventLocation } = req.body;

			if (!token || (eventId === undefined || eventId === null || eventId === "")) {
				return res.status(400).json({ error: 'Missing required fields' });
			}

			if (jwtHelper.isExpired(token)) {
				return res.status(200).json({ error: "The JWT is no longer valid", token: "" });
			}

			// Normalize EventId the same way readEvent does
			const numericEventId = Number(eventId);
			const queryEventId = isNaN(numericEventId) ? eventId : numericEventId;

			const db = client.db("COP4331Cards");
			const events = db.collection('Events');

			const userId = jwtHelper.getUserFromToken(token).userId;

			if (!userId) {
				return res.status(401).json({ error: 'Invalid token' });
			}

			// Build update object only from provided fields
			const updateFields = {};
			if (eventTitle !== undefined) updateFields.EventTitle = eventTitle;
			if (eventDescription !== undefined) updateFields.EventDescription = eventDescription;
			if (eventTime !== undefined) updateFields.EventTime = eventTime;
			if (eventDuration !== undefined) updateFields.EventDuration = eventDuration;
			if (eventLocation !== undefined) updateFields.EventLocation = eventLocation;

			if (Object.keys(updateFields).length === 0) {
				const refreshedToken = jwtHelper.refresh(token);
				return res.status(400).json({ error: 'No fields to update', token: refreshedToken });
			}

			// Only allow owner to update their event
			const filter = { EventId: queryEventId, EventOwnerId: userId };
			const result = await events.updateOne(filter, { $set: updateFields });

			const refreshedToken = jwtHelper.refresh(token);

			if (result.matchedCount === 0) {
				return res.status(404).json({ error: 'Event not found or not owned by user', token: refreshedToken });
			}

			const updatedEvent = await events.findOne(filter);

			return res.status(200).json({ token: refreshedToken, eventObject: updatedEvent });
		} catch (err) {
			console.error("Error in /api/updateEvent:", err);
			res.status(500).json({ error: "Server error" });
		}
	});
};