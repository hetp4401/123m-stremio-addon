const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;

const DB = new Map();

getCollection();

function insertDocuments(documents) {
  return MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true }).then(
    (client) => {
      const db = client.db();
      const col = db.collection("streams");

      var count = 0;
      Promise.all(
        documents.map((doc) =>
          col.findOne({ key: doc.key }).then((res) => {
            if (!res) {
              col.insertOne(doc).then((res) => {
                count += 1;
              });
            }
          })
        )
      ).then((res) => {
        console.log(`${count}/${documents.length} docs inserted`);
        client.close();
      });
    }
  );
}

function getCollection() {
  return MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true }).then(
    (client) =>
      client
        .db()
        .collection("streams")
        .find({})
        .toArray()
        .then((res) => {
          DB.clear();
          res.forEach(({ key, value }) => {
            DB.set(key, value);
          });
          console.log("pulled from DB");
          client.close();
          return res;
        })
  );
}

function getFromDB(id) {
  const res = DB.get(id);
  return res;
}

module.exports = { insertDocuments, getFromDB, getCollection };

