exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    // incoming: userId, color
    // outgoing: error
    var token = require("./createJWT.js");
    const { userId, card, jwtToken } = req.body;
    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: "The JWT is no longer valid", jwtToken: "" };
        res.status(200).json(r);
        return;
      }
    } catch (e) {
      console.log(e.message);
    }

    const newCard = { Card: card, UserId: userId };
    var error = "";
    try {
      const db = client.db("COP4331Cards");
      const result = db.collection("Cards").insertOne(newCard);
    } catch (e) {
      error = e.toString();
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    } catch (e) {
      console.log(e.message);
    }
    var ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });
};