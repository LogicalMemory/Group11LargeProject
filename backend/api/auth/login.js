const bcrypt = require("bcrypt");
const jwtHelper = require("../../createJWT.js");

exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res) => {
    try {
      // incoming: login, password
      // outgoing: id, firstName, lastName, token OR error
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const db = client.db("COP4331Cards");

      // finds the user by login
      const user = await db.collection("Users").findOne({ Login: login });
      if (!user) {
        return res.status(401).json({ error: "Login/Password incorrect" });
      }

      // compare entered password with stored hash
      const validPassword = await bcrypt.compare(password, user.PasswordHash);
      if (!validPassword) {
        return res.status(401).json({ error: "Login/Password incorrect" });
      }

      const token = jwtHelper.createToken(
        user.FirstName,
        user.LastName,
        user.UserId,
      );

      return res.status(200).json({
        id: user.UserId,
        firstName: user.FirstName,
        lastName: user.LastName,
        token: token.token || token,
      });
    } catch (err) {
      console.error("Error in /api/login:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
};
