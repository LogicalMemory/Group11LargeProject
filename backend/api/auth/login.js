exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    var error = "";
    const { login, password } = req.body;
    const db = client.db("COP4331Cards");
    // const result = db.collection('Users').insertOne({Login:login,Password:password})
    const results = await db
      .collection("Users")
      .find({ Login: login, Password: password })
      .toArray();
    var id = -1;
    var fn = "";
    var ln = "";
    var ret;
    if (results.length > 0) {
      id = results[0].UserId;
      fn = results[0].FirstName;
      ln = results[0].LastName;
      try {
        const token = require("../../createJWT.js");
        ret = token.createToken(fn, ln, id);
      } catch (e) {
        ret = { error: e.message };
      }
    } else {
      ret = { error: "Login/Password incorrect" };
    }
    res.status(200).json(ret);
  });
};
