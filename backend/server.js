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

var api = require('./load_api');
api.loadApi(app,client);


app.listen(5000, () => {
    console.log('Server running successfully');
  }); // start Node + Express server on port 5000