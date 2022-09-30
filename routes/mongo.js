// @ts-check
const { MongoClient, ServerApiVersion } = require('mongodb');

// const uri =
//   'mongodb+srv://ebulsok:Tndydlf0914@cluster0.mhxf9lp.mongodb.net/?retryWrites=true&w=majority';
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

module.exports = client;
