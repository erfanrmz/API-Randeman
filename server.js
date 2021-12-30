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
      res.json(resource.tasks);
  });
});
app.get("/getTaskByDate/:id", (req, res) => {
  const d = new Date(`${req.query.day} ${req.query.month} 2021`);
  const until = new Date(`${req.query.day} ${req.query.month} 2021`);
  until.setHours(until.getHours() + 4);
  until.setMinutes(until.getMinutes() + 29);
  d.setHours(d.getHours() - 19);
  d.setMinutes(d.getMinutes() - 30);
  Resource.findOne({
    unique_id: req.params.id,
    "tasks.deadline": new Date(2021, 7, 21),
  }).exec(function (err, resource) {
    if (!err)
      // resource.tasks.push(task);
      // resource.save();
      res.json(resource);
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
function getDayOfYear(date) {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
app.get("/getTasksByduration/:id", (req, res) => {
  var now = new Date();
  var start = new Date(2021, 0, 0);
  start.setHours(start.getHours() + 24);
  start.setMinutes(start.getMinutes() + 210);
  start.setHours(start.getHours() + 7877);
  Resource.findOne({ unique_id: req.params.id }).exec(function (err, resource) {
    if (resource) {
      let n = resource.tasks.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          if (resource.tasks[j].priority > resource.tasks[j + 1].priority) {
            let temp = resource.tasks[j];
            resource.tasks[j] = resource.tasks[j + 1];
            resource.tasks[j + 1] = temp;
          }
        }
      }
      let result = [];
      let task = [];
      var t = 8760;
      for (let i = 0; i < t; i++) {
        task[i] = "-1";

        result[i] = false;
      }
      for (let i = 0; i < n; i++) {
        for (
          let j = (t - 1, getDayOfYear(resource.tasks[i].deadline) * 24);
          j >= 0;
          j--
        ) {
          if (result[j] == false) {
            var startedAt = new Date(2021, 0, 0);
            var endedAt = new Date(2021, 0, 0);
            startedAt.setHours(startedAt.getHours() + 19);
            startedAt.setMinutes(startedAt.getMinutes() + 210);
            endedAt.setHours(endedAt.getHours() + 24);
            endedAt.setMinutes(endedAt.getMinutes() + 210);
            startedAt.setHours(startedAt.getHours() + j - 21);
            endedAt.setHours(
              endedAt.getHours() + j - resource.tasks[i].duration - 21
            );
            resource.tasks[i].startedAt = startedAt;
            resource.tasks[i].endedAt = endedAt;
            for (let k = 0; k < resource.tasks[i].duration; k++) {
              result[j - k] = true;
              task[j - k] = resource.tasks[i].name;
            }

            break;
          }
        }
      }
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          if (resource.tasks[j].startedAt > resource.tasks[j + 1].startedAt) {
            let temp = resource.tasks[j];
            resource.tasks[j] = resource.tasks[j + 1];
            resource.tasks[j + 1] = temp;
          }
        }
      }
      resource.save();
      res.json(resource.tasks);
    }
  });
});
app.post("/register", (req, res) => {
  var c;
  User.findOne()
    .sort({ field: "asc", _id: -1 })
    .exec(function (err, data) {
      if (data) {
        c = data.unique_id + 1;
      } else {
        c = 1;
      }
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
    if (user) {
      if (user.password == req.body.password) {
        console.log("logged in");
        res.sendStatus(200);
      } else {
        console.log("unauthorized");
        res.sendStatus(401);
      }
    } else {
      console.log("unauthorized");
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
