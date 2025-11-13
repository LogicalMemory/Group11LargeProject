const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.createToken = function (fn, ln, id) {
  return _createToken(fn, ln, id);
};

_createToken = function (fn, ln, id) {
  try {

    const expiration = new Date();
    const user = { userId: id, firstName: fn, lastName: ln };
    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'} );

    var ret = { accessToken: accessToken };
  } catch (e) {
    var ret = { error: e.message };
  }
  return ret;
};
exports.isExpired = function (token) {
  var isError = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, verifiedJwt) => {
      if (err) {
        return true;
      } else {
        return false;
      }
    },
  );
  return isError;
};
exports.refresh = function (token) {
  try {
    var ud = jwt.decode(token, { complete: true });
    if (!ud || !ud.payload) {
      throw new Error('Invalid token payload');
    }

    var userId = ud.payload.userId ?? ud.payload.id;
    var firstName = ud.payload.firstName;
    var lastName = ud.payload.lastName;

    if (!userId) {
      throw new Error('Missing user id in token');
    }

    return _createToken(firstName, lastName, userId);
  } catch (e) {
    return { error: e.message };
  }
};

exports.getUserFromToken = function (token) {
  if (exports.isExpired(token)) {
    return null;
  }
  var ud = jwt.decode(token, { complete: true });
  return ud.payload;
};

exports.getUserFromToken = function (token) {
  if (exports.isExpired(token)) {
    return null;
  }
  var ud = jwt.decode(token, { complete: true });
  return ud.payload;
};