const express = require('express');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();

app.use(cors());
app.use(express.json());

console.log('About to load API routes...');
var api = require('./load_api');
api.loadApi(app, client);
console.log('API routes loaded!');


app.listen(5000, '0.0.0.0', () => {
    console.log('Server running successfully on http://0.0.0.0:5000');
  }
); // start Node + Express server on port 5000