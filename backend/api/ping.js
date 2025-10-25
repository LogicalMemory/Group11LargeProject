exports.setApp = function (app, client, api_path) {
  app.use((req, res, next) => {
    app.get(api_path, (req, res, next) => {
      res.status(200).json({ message: "Hello World" });
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    next();
  });
};