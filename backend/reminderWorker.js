const { MongoClient } = require('mongodb');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI. Cannot start reminder worker.');
  process.exit(1);
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  console.warn('ACCESS_TOKEN_SECRET not set. Reminder emails will still send, but tokens cannot be refreshed if needed.');
}

const POLL_INTERVAL_MS = Number(process.env.REMINDER_POLL_INTERVAL_MS) || 60000;
const LOOKAHEAD_MINUTES = Number(process.env.REMINDER_LOOKAHEAD_MINUTES) || 1;
const SENDGRID_FROM = process.env.SENDGRID_FROM_EMAIL || 'loopu2025@gmail.com';

const ensureSendGridApiKey = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SENDGRID_API_KEY');
  }
  sgMail.setApiKey(apiKey);
};

const formatEmailBody = (reminder) => {
  const eventTime = reminder.EventTime ? new Date(reminder.EventTime) : null;
  const friendlyDate =
    eventTime && !Number.isNaN(eventTime.getTime())
      ? eventTime.toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'now';

  return `
    <p>Hi ${reminder.UserName || 'LoopU friend'},</p>
    <p>This is your reminder that <strong>${reminder.EventTitle}</strong> is starting.</p>
    <p><strong>When:</strong> ${friendlyDate}</p>
    ${reminder.EventLocation ? `<p><strong>Where:</strong> ${reminder.EventLocation}</p>` : ''}
    <p>${reminder.EventDescription || ''}</p>
    <p>Have a great time! — LoopU</p>
  `;
};

const main = async () => {
  try {
    ensureSendGridApiKey();
  } catch (err) {
    console.error('Cannot start reminder worker:', err.message);
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  console.log('Reminder worker connected to MongoDB');

  const db = client.db('COP4331Cards');
  const reminders = db.collection('EventReminders');

  const processReminders = async () => {
    try {
      const now = new Date();
      const windowEnd = new Date(now.getTime() + LOOKAHEAD_MINUTES * 60 * 1000);

      const pendingReminders = await reminders
        .find({ status: 'pending', sendAt: { $lte: windowEnd } })
        .limit(20)
        .toArray();

      for (const reminder of pendingReminders) {
        const lockResult = await reminders.updateOne(
          { _id: reminder._id, status: 'pending' },
          { $set: { status: 'sending', lastAttemptAt: new Date() } },
        );
        if (lockResult.modifiedCount === 0) {
          continue;
        }

        try {
          const emailBody = formatEmailBody(reminder);
          const msg = {
            to: reminder.UserEmail,
            from: SENDGRID_FROM,
            subject: `LoopU Reminder: ${reminder.EventTitle}`,
            text: emailBody.replace(/<[^>]*>/g, ''),
            html: emailBody,
          };
          await sgMail.send(msg);

          await reminders.updateOne(
            { _id: reminder._id },
            { $set: { status: 'sent', sentAt: new Date(), attempts: (reminder.attempts || 0) + 1 } },
          );

          console.log(`Sent reminder for event ${reminder.EventId} to ${reminder.UserEmail}`);
        } catch (err) {
          console.error(`Failed to send reminder for event ${reminder.EventId}`, err.message);
          await reminders.updateOne(
            { _id: reminder._id },
            {
              $set: {
                status: 'pending',
                errorMessage: err.message,
                attempts: (reminder.attempts || 0) + 1,
                lastAttemptAt: new Date(),
              },
            },
          );
        }
      }
    } catch (err) {
      console.error('Reminder worker iteration failed:', err.message);
    }
  };

  await processReminders();
  setInterval(processReminders, POLL_INTERVAL_MS);
};

main().catch((err) => {
  console.error('Reminder worker crashed:', err);
  process.exit(1);
});
