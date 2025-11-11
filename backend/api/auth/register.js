const bcrypt = require('bcrypt');
const jwtHelper = require('../../createJWT.js');

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res) => {
    try {
      // incoming: firstName, lastName, login, password
      // outgoing: id, firstName, lastName, token OR error
      const { firstName, lastName, login, password } = req.body;

      if (!firstName || !lastName || !login || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const db = client.db('COP4331Cards');
      const users = db.collection('Users');

      // Check if login already exists
      const existing = await users.findOne({ Login: login });
      if (existing) {
        return res.status(409).json({ error: 'Login already exists' });
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate UserId (incremental)
      const lastUser = await users.find().sort({ UserId: -1 }).limit(1).toArray();
      const nextId = lastUser.length > 0 ? lastUser[0].UserId + 1 : 1;

      const newUser = {
        UserId: nextId,
        FirstName: firstName,
        LastName: lastName,
        Login: login,
        PasswordHash: passwordHash
      };

      await users.insertOne(newUser);

      // Generate JWT token
      const tokenPayload = jwtHelper.createToken(firstName, lastName, nextId);

      res.status(201).json({
        id: nextId,
        firstName,
        lastName,
        token: tokenPayload.token || tokenPayload
      });

      // Send email verification
      // using Twilio SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      const msg = {
        to: login, // Change to your recipient
        from: 'loopu2025@gmail.com', // Change to your verified sender
        subject: 'LoopU: Verify Your Email',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })
    } catch (err) {
      console.error('Error in /api/register:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};
