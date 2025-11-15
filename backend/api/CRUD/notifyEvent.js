const jwtHelper = require('../../createJWT.js');
const sgMail = require('@sendgrid/mail');

const formatEmailDate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const ensureSendGridConfigured = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SENDGRID_API_KEY environment variable');
  }
  sgMail.setApiKey(apiKey);
  return process.env.SENDGRID_FROM_EMAIL || 'loopu2025@gmail.com';
};

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res) => {
    try {
      const { token, eventId } = req.body || {};

      if (!token || eventId === undefined || eventId === null || eventId === '') {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(200).json({ error: 'The JWT is no longer valid', token: '' });
      }

      const userPayload = jwtHelper.getUserFromToken(token);
      if (!userPayload?.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const db = client.db('COP4331Cards');
      const users = db.collection('Users');
      const events = db.collection('Events');
      const reminders = db.collection('EventReminders');

      const requestingUser = await users.findOne({ UserId: userPayload.userId });
      if (!requestingUser || !requestingUser.Login) {
        return res.status(400).json({ error: 'Unable to find an email for this user.' });
      }

      const numericEventId = Number(eventId);
      const lookupId = Number.isNaN(numericEventId) ? eventId : numericEventId;
      const eventDoc = await events.findOne({ EventId: lookupId });

      if (!eventDoc) {
        return res.status(404).json({ error: 'Event not found' });
      }

      let fromAddress;
      try {
        fromAddress = ensureSendGridConfigured();
      } catch (err) {
        console.error('SendGrid configuration error:', err.message);
        return res.status(500).json({ error: 'Email service is not configured.' });
      }

      const rawEventTime = eventDoc.EventTime ? new Date(eventDoc.EventTime) : null;
      let reminderSendAt;
      if (rawEventTime && !Number.isNaN(rawEventTime.getTime())) {
        reminderSendAt = rawEventTime;
      } else {
        reminderSendAt = new Date(Date.now() + 5 * 60 * 1000);
      }

      await reminders.updateOne(
        { EventId: lookupId, UserId: userPayload.userId },
        {
          $set: {
            EventId: lookupId,
            UserId: userPayload.userId,
            UserEmail: requestingUser.Login,
            UserName: `${requestingUser.FirstName ?? ''} ${requestingUser.LastName ?? ''}`.trim() || requestingUser.Login,
            EventTitle: eventDoc.EventTitle || 'LoopU Event',
            EventDescription: eventDoc.EventDescription || '',
            EventLocation: eventDoc.EventLocation || '',
            EventTime: eventDoc.EventTime || null,
            sendAt: reminderSendAt,
            status: 'pending',
            attempts: 0,
            lastAttemptAt: null,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );

      const friendlyDate = formatEmailDate(eventDoc.EventTime) || 'the scheduled time';
      const emailBody = `
        <p>Hey ${requestingUser.FirstName || 'LoopU friend'},</p>
        <p>You're set to receive a reminder when <strong>${eventDoc.EventTitle || 'a LoopU event'}</strong> begins.</p>
        <p><strong>When:</strong> ${friendlyDate}</p>
        ${eventDoc.EventLocation ? `<p><strong>Where:</strong> ${eventDoc.EventLocation}</p>` : ''}
        <p>We'll send another notification automatically when the event starts—stay tuned!</p>
        <p>— LoopU</p>
      `;

      const msg = {
        to: requestingUser.Login,
        from: fromAddress,
        subject: `LoopU reminder scheduled: ${eventDoc.EventTitle || 'Upcoming event'}`,
        text: emailBody.replace(/<[^>]*>/g, ''),
        html: emailBody,
      };

      await sgMail.send(msg);

      const refreshedToken = jwtHelper.refresh(token);

      return res.status(200).json({
        message: 'Check your inbox—we sent a reminder email for this event.',
        token: refreshedToken,
      });
    } catch (err) {
      console.error('Error in /api/notifyEvent:', err);
      if (err.response?.body) {
        console.error(err.response.body);
      }
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
