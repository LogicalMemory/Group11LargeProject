const express = require('express');
const cors = require('cors');
const path = require('path'); 
const app = express();

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('About to load API routes...');
var api = require('./load_api');
api.loadApi(app, client);
console.log('API routes loaded!');

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running successfully on http://${HOST}:${PORT}`);
  }
); // start Node + Express server
