const express = require("express");
const mongoose = require("mongoose");
var Resource = require(__dirname + "/resource.js");
var User = require(__dirname + "/user.js");

mongoose.connect(
  "mongodb+srv://ResourceManager:0F7i0QjXzcL6yaoJ@resourcemanager.yosak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();

app.use(
  express.json({
    limit: "50mb",
  })
);

app.get("/resources", (req, res) => {
  var delayInMilliseconds = 2000; //2 second
  setTimeout(function () {
    Resource.find({}).exec(function (err, resources) {
      res.json(resources);
    });
  }, delayInMilliseconds);
});
app.get("/getTask/:id", (req, res) => {
  // var task = { name: "refactor", duration: 2000, priority: 5 };
  Resource.findOne({ unique_id: req.params.id }).exec(function (err, resource) {
    if (!err)
      // resource.tasks.push(task);
      // resource.save();
      res.send(resource.tasks);
  });
});
app.post("/addTask/:id", (req, res) => {
  var date = req.body.deadline.split("/");
  var deadline = new Date(`${date[2]}-${date[1]}-${date[0]}`);
  Resource.findOne({ unique_id: req.params.id }).exec(function (err, resource) {
    if (!err) {
      var task = {
        unique_id: resource.tasks.length,
        name: req.body.name,
        duration: req.body.duration,
        priority: req.body.priority,
        resource: resource.name,
        createdDate: new Date(),
        deadline: deadline,
      };
      resource.tasks.push(task);
      resource.save();
      res.sendStatus(200);
    }
  });
});
app.post("/register", (req, res) => {
  User.findOne()
    .sort({ field: "asc", _id: -1 })
    .exec(function (err, data) {
      const newUser = new User({
        unique_id: c,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        accountType: req.body.accountType,
      });
      newUser.save();
      res.sendStatus(200);
    });
});

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }).exec(function (err, user) {
    if (user.password == req.body.password) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });
});

app.post("/addResource", (req, res) => {
  console.log(req.body);
  var c;
  Resource.findOne()
    .sort({ field: "asc", _id: -1 })
    .exec(function (err, data) {
      console.log(data);
      if (data) {
        c = data.unique_id + 1;
      } else {
        c = 1;
      }
      const newResource = new Resource({
        unique_id: c,
        name: req.body.name,
        description: req.body.description,
      });
      newResource.save();
      res.sendStatus(200);
    });
});

app.listen(8080, () => {
  console.log("Server listening on port 3000");
});
