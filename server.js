const express = require("express");
let mongodb = require("mongodb");
let sanitizeHTML = require("sanitize-html");

const app = express();
let db;

let port = process.env.PORT;
if (port === null || port === "") {
  port = 3000;
}

app.use(express.static("public"));

let connectionString =
  "mongodb+srv://markos84uk:6GepFQzgokJXKe7s@cluster0-j50v7.mongodb.net/TodoApp?retryWrites=true&w=majority";
mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    db = client.db();
    app.listen(port);
  }
);

// Bolierplate code
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const passwordProtected = (req, res, next) => {
  res.set("WWW-Authenticate", 'Basic realm="Simple Todo App"');
  console.log(req.headers.authorization);
  if (req.headers.authorization === "Basic bWFya3NhcHA6bWFya3ltYXJr") {
    next();
  } else {
    res.status(401).send("Authentication required");
  }
};
app.use(passwordProtected);

app.get("/", (req, res) => {
  db.collection("items")
    .find()
    .toArray(function(err, items) {
      res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <style>
      body {
        font-family: 'system-ui'
      }

      .display-4 {
        color: #333;
        font-size: 48px;
      }
      
      .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100vw;
        margin-left: auto;
        margin-right: auto;
        background-color: whitesmoke
      }
      .jumbotron {
        width: 100%;
      }
      
      .d-flex {
        background-color: #e0e0e0;
        padding: 30px;
        width: 70%;
        border-radius: 5px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 30px;
      }
      
      .align-items-center {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      
      .form-control {
        height: 20px;
        width: 200px;
        padding: 8px 12px;
        margin-right: 15px;
        font-size: 14px;
        border: 1px;
        border-color: gray;
        border-radius: 5px;
      }
      
      .btn {
        background-color: #007BFF;
        color: white;
        padding: 10px 13px;
        font-size: 14px;
        border: none;
        border-radius: 5px;
      }
      
      .delete-me {
        background-color: #C82333
      }
      
      .list-group {
        width: 70%;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        flex-direction: column;
        background-color: lightgray;
        border-radius: 5px;
        padding-left: 0px
      }
      
      .item-text {
        width: 100%;
      }
      
      .button-wrap {
        display: flex;
      }
      
      .list-group-item {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background-color: white;
        padding: 12px;
        border-color: black;
        border-radius: 5px;
        border: 2px;
        margin-bottom: 2px;
      }
      
      .edit-me {
        margin-right: 10px
      }      
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">George's Todo App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input placeholder="Add an item" id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
          
        </ul>
        
      </div>
      <script>
          let items = ${JSON.stringify(items)}
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="browser.js"></script>
      </script>
    </body>
    </html>`);
    });
});

app.post("/create-item", (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  });
  db.collection("items").insertOne({ text: safeText }, function(err, info) {
    res.json(info.ops[0]);
  });
});

app.post("/update-item", (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  });
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    function() {
      res.send("update OK");
    }
  );
});

// this should work with the delete function in browser.js
app.post("/delete-item", (req, res) => {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectID(req.body.id) },
    function() {
      res.send("deleted");
    }
  );
});
