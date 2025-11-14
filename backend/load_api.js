exports.loadApi = function (app, client) {
  const fs = require('fs');
  const path = require('path');

  function listFilesRecursive(directoryPath) {
    let filesList = [];

    function walkDir(currentPath) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
          filesList.push(itemPath);
        } else if (stat.isDirectory()) {
          walkDir(itemPath); // Recursively call for subdirectories
        }
      }
    }

    walkDir(directoryPath);
    return filesList;
  }

  const targetDirectory = './api';
  const allFiles = listFilesRecursive(targetDirectory);

  console.log('\n=== Loading API Routes ===');
  console.log('Files found:', allFiles);

  allFiles.forEach(element => {
    const required_prefix = ".js";
    if (!element.endsWith(required_prefix)) return;

    // Remove .js extension
    var endpoint_name = element.slice(0, -required_prefix.length);
    // Convert Windows backslashes to forward slashes for URL path
    var endpoint_path = '/' + endpoint_name.replace(/\\/g, '/');

    try {
      var api_endpoint = require('./' + endpoint_name);
      console.log(`Module loaded, calling setApp with path: ${endpoint_path}`);
      api_endpoint.setApp(app, client, endpoint_path);
      console.log(`✓ Successfully registered: ${endpoint_path}`);
    } catch (err) {
      console.error(`✗ Error loading ${element}:`, err.message);
    }
  });

  console.log('\n=== All API routes processing complete ===\n');
};