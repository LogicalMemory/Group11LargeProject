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
  
  allFiles.forEach(element => {
      const required_prefix = ".js"
      if (!element.endsWith(required_prefix)) return; // This is actually a continue.
  
      var endpoint_name = element.slice(0, -required_prefix.length);
  
      var api_endpoint = require('./' + endpoint_name);
      api_endpoint.setApp( app, client, '/' + endpoint_name);
  });
  
};
