exports.setApp = function (app, client, api_path) {
  app.post(api_path, async (req, res, next) => {
    // incoming: userId, search
    // outgoing: results[], error
    var error = "";

    var token = require("../../createJWT.js");
    const { userId, search, jwtToken } = req.body;
    try {
      if (token.isExpired(jwtToken)) {
        var r = { error: "The JWT is no longer valid", jwtToken: "" };
        res.status(200).json(r);
        return;
      }
    } catch (e) {
      console.log(e.message);
    }

    var _search = search.trim();

    const db = client.db("COP4331Cards");
    const results = await db
      .collection("Cards")
      .find({ Card: { $regex: _search + ".*", $options: "i" } })
      .toArray();

    var _ret = [];
    for (var i = 0; i < results.length; i++) {
      _ret.push(results[i].Card);
    }

    var refreshedToken = null;
    try {
      refreshedToken = token.refresh(jwtToken);
    } catch (e) {
      console.log(e.message);
    }
    var ret = { results: _ret, error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });
};