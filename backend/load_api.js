const fs = require("fs");
const path = require("path");

exports.loadApi = function (app, client) {
  const baseDir = path.join(__dirname, "api");

  console.log("\n==== Loading API Routes ====\n");

  function loadRoutes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // go through subdirectories
      if (entry.isDirectory()) {
        loadRoutes(fullPath);
        continue;
      }

      // Only load .js files
      if (!entry.name.endsWith(".js")) continue;

      // Build API endpoint path
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const endpointPath = "/api/" + relativePath.replace(/\.js$/, "");

      try {
        const routeModule = require(fullPath);
        routeModule.setApp(app, client, endpointPath);
        console.log(`Registered route: ${endpointPath}`);
      } catch (err) {
        console.error(`\x1b[31mERROR LOADING: ${relativePath}\x1b[0m`);
        // console.error(err.message); // error message
      }
    }
  }

  loadRoutes(baseDir);

  console.log("\n==== All API routes processed ====\n");
};
