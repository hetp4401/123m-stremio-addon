const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;

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

module.exports = { insertDocuments };
