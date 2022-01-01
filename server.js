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
app.get("/companyInformation/:id", (req, res) => {
  var resourceCount = 0;
  var taskCount = 0;
  var ContributorCount = 0;
  var announcementCount = 0;
  var contributors = ["erfan", "kiana", "mina"];
  Resource.find({ company_id: req.params.id }).exec(function (err, found) {
    if (found) {
      console.log(found.length);
      resourceCount = found.length;
      for (let i = 0; i < found.length; i++) {
        if (found[i].tasks) {
          taskCount += found[i].tasks.length;
        }
      }
      User.findOne({ company_id: req.params.id, accountType: "company" }).exec(
        function (err, company) {
          if (company.contributors && company.announcements) {
            res.json({
              resourceCount: resourceCount,
              taskCount: taskCount,
              ContributorCount: company.contributors.length,
              announcementCount: company.announcements.length,
              contributors: company.contributors,
              announcements: company.announcements,
            });
          } else if (company.contributors && !company.announcements) {
            res.json({
              resourceCount: resourceCount,
              taskCount: taskCount,
              ContributorCount: company.contributors.length,
              announcementCount: announcementCount,
              contributors: company.contributors,
              announcements: [],
            });
          } else if (!company.contributors && company.announcements) {
            res.json({
              resourceCount: resourceCount,
              taskCount: taskCount,
              ContributorCount: company.contributors.length,
              announcementCount: company.announcements.length,
              contributors: [],
              announcements: company.announcements,
            });
          } else {
            res.json({
              resourceCount: resourceCount,
              taskCount: taskCount,
              ContributorCount: 3,
              announcementCount: announcementCount,
              contributors: contributors,
              announcements: [],
            });
          }
        }
      );
    }
  });
});
app.get("/resources/:id", (req, res) => {
  var delayInMilliseconds = 2000; //2 second
  setTimeout(function () {
    Resource.find({ company_id: req.params.id }).exec(function (
      err,
      resources
    ) {
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
  var arr = [];
  // const d = new Date(`${req.query.day} ${req.query.month} 2021`);
  // const until = new Date(`${req.query.day} ${req.query.month} 2021`);
  // until.setHours(until.getHours() + 4);
  // until.setMinutes(until.getMinutes() + 29);
  // d.setHours(d.getHours() - 19);
  // d.setMinutes(d.getMinutes() - 30);
  Resource.findOne({
    unique_id: req.params.id,
  }).exec(function (err, resource) {
    if (!err) {
      dateS = new Date(req.query.year, req.query.month, req.query.day);
      dateE = new Date(req.query.year, req.query.month, req.query.day);
      dateE.setHours(dateE.getHours() + 27);
      dateE.setMinutes(dateE.getMinutes() + 30);
      dateS.setHours(dateS.getHours() + 3);
      dateS.setMinutes(dateS.getMinutes() + 30);
      console.log(dateS);
      console.log(dateE);
      if (resource.tasks.length !== null) {
        for (var i = 0; i < resource.tasks.length; i++) {
          if (
            resource.tasks[i].startedAt >= dateS &&
            resource.tasks[i].startedAt < dateE
          ) {
            arr.push(resource.tasks[i]);
          }
        }
        res.json(arr);
      }
    } else {
      res.json({});
    }
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
            startedAt.setHours(startedAt.getHours());
            startedAt.setMinutes(startedAt.getMinutes());
            endedAt.setHours(endedAt.getHours());
            endedAt.setMinutes(endedAt.getMinutes());
            startedAt.setHours(startedAt.getHours() + j);
            endedAt.setHours(
              endedAt.getHours() + j - resource.tasks[i].duration
            );
            resource.tasks[i].startedAt = endedAt;
            resource.tasks[i].endedAt = startedAt;
            resource.save();
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
  var l;
  User.findOne()
    .sort({ field: "asc", _id: -1 })
    .exec(function (err, data) {
      if (data) {
        c = data.unique_id + 1;
      } else {
        c = 1;
      }
      User.findOne()
        .sort({ field: "asc", company_id: -1 })
        .exec(function (err, company) {
          if (company) {
            if (company.company_id) {
              d = company.company_id + 1;
            } else {
              d = 1;
            }
          }
          if (req.body.accountType != "company") d = null;
          const newUser = new User({
            unique_id: c,
            company_id: d,
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
});
app.post("/addContributor/:id", (req, res) => {
  User.findOne({ company_id: req.params.id, accountType: "company" }).exec(
    function (err, admin) {
      if (admin) {
        User.findOne({ email: req.query.email }).exec(function (
          err,
          contributor
        ) {
          if (contributor) {
            admin.contributors.push(contributor.firstName);
            admin.save();
            res.sendStatus(200);
          } else {
            res.sendStatus(404);
          }
        });
      } else {
        res.sendStatus(404);
      }
    }
  );
});
app.post("/addAnnouncements/:id", (req, res) => {
  User.findOne({ company_id: req.params.id, accountType: "company" }).exec(
    function (err, admin) {
      if (admin) {
        admin.announcements.push(req.query.announcement);
        admin.save();
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    }
  );
});
app.post("/login", (req, res) => {
  console.log("hello here");
  User.findOne({ email: req.body.email }).exec(function (err, user) {
    if (user) {
      if (user.password == req.body.password) {
        console.log("logged in");
        res.json({
          userid: user.unique_id,
          statusCode: 200,
          company_id: user.company_id,
        });
      } else {
        console.log("unauthorized");
        res.json({ userid: null, statusCode: 401, company_id: null });
      }
    } else {
      console.log("unauthorized");
      res.json({ userid: null, statusCode: 401, company_id: null });
    }
  });
});
app.get("/getAccountInfo/:id", (req, res) => {
  User.findOne({ unique_id: req.params.id }).exec(function (err, user) {
    res.json({
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.email,
      company_id: user.company_id,
    });
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
        company_id: req.body.company_id,
        name: req.body.name,
        description: req.body.description,
      });
      newResource.save();
      res.sendStatus(200);
    });
});
app.get("/getDaysOfMonth", (req, res) => {
  var days = [];
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  for (let i = 1; i < 32; i++) {
    d = new Date(`${i} ${req.query.month} 2022`);
    day = {
      daysOfWeek: weekday[d.getDay()],
      daysOfMonth: i,
    };
    days.push(day);
  }
  res.json(days);
});

app.listen(3000 || 8080, () => {
  console.log("Server listening on port 3000");
});
