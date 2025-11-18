const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating verification token
const jwtHelper = require('../../createJWT.js');
const { sendVerificationEmail } = require("./emailverification"); 

exports.setApp = function (app, client, api_path) {
  
      const db = client.db('COP4331Cards');
      const users = db.collection('Users');
  
  app.post(api_path, async (req, res) => {
    try {
      // incoming: firstName, lastName, login, password
      // outgoing: id, firstName, lastName, token OR error
      const { firstName, lastName, login, password } = req.body;

      if (!firstName || !lastName || !login || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      //const db = client.db('COP4331Cards');
      //const users = db.collection('Users');

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

      const verificationToken = crypto.randomBytes(32).toString('hex');

      const newUser = {
        UserId: nextId,
        FirstName: firstName,
        LastName: lastName,
        Login: login,
        PasswordHash: passwordHash,
        ProfileImageUrl: null,
        IsVerified: false,
        verificationToken: verificationToken
      };

      await users.insertOne(newUser);

      // Generate JWT token
      const tokenPayload = jwtHelper.createToken(firstName, lastName, nextId);

      res.status(201).json({
        id: nextId,
        firstName,
        lastName,
        email: login,
        profileImageUrl: null,
        token: tokenPayload.token || tokenPayload
      });

      // Send email verification
      sendVerificationEmail(firstName, login, verificationToken, IsVerified);
    } catch (err) {
      console.error('Error in /api/register:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  /*app.get('/api/verify-email/:verificationToken', async (req, res) => {
    
    const token = req.params.verificationToken;
    const user = await users.findOne({ verificationToken: token });

    await users.updateOne(
        { UserId: user.UserId },
        {
          $set: { IsVerified: true },


        }
      )
      res.status(500).json({ message: 'updated verification' });
      followupVerification(user.Login, user.IsVerified);
    });*/
};
