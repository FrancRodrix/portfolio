var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var url = "mongodb://localhost:27017/mLog";

/* GET home page. */
router.get("/", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mLog");
    let d = new Date();
    // get the projects
    dbo
      .collection("projects")
      .find({})
      .limit(3)
      .toArray(function(err, projects) {
        if (err) throw err;
        console.log(JSON.stringify(projects));
        // get the posts
        dbo
          .collection("blog")
          .find({})
          .sort({ date_created: -1 })
          .limit(3)
          .toArray(function(err, blog) {
            if (err) throw err;
            console.log(JSON.stringify(blog));
            db.close();

            res.render("index", {
              title: "Home Page",
              projects: projects,
              blogs: blog,
              layout: "layout"
            });
          });
      });
  });
});
// project router
router.get("/project", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mLog");
    let d = new Date();
    dbo
      .collection("projects")
      .find({})
      .toArray(function(err, data) {
        if (err) throw err;
        console.log(JSON.stringify(data));
        db.close();
        res.render("project", {
          title: "Project Page",
          projects: data,
          layout: "layout2"
        });
      });
  });
});
// project router end

// project-detail routter
router.get("/project/:id", function(req, res) {
  let id = req.params.id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mLog");
    dbo
      .collection("projects")
      .findOne({ _id: new ObjectId(id) }, function(err, data) {
        if (err) throw err;
        console.log(JSON.stringify(data));
        db.close();
        res.render("project-detail", {
          title: "Project-detail Page",
          projects: data,
          layout: "layout4"
        });
      });
  });
});
// project-detail end

// blog router

router.get("/blog", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mLog");
    let d = new Date();
    dbo
      .collection("blog")
      .find({})
      .toArray(function(err, blog) {
        if (err) throw err;
        console.log(JSON.stringify(blog));
        db.close();
        res.render("blog", {
          title: "Blog Page",
          blog: blog,
          layout: "layout"
        });
      });
  });
});
// blog router end
// blog-detail router
router.get("/blog/:id", function(req, res, next) {
  let id = req.params.id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    let dbo = db.db("mLog");
    dbo
      .collection("blog")
      .findOne({ _id: new ObjectId(id) }, function(err, blog) {
        if (err) throw err;
        console.log(JSON.stringify(blog));
        db.close();
        res.render("blog-detail", {
          title: "Blog Detail",
          blog: blog,
          layout: "layout5"
        });
      });
  });
});
// blog detail router end

// about router
router.get("/about", function(req, res, next) {
  res.render("about", { title: "Express", layout: "layout6" });
});
// about router end

// contact router

router.get("/contact", function(req, res, next) {
  res.render("contact", { title: "Home Page", layout: "layout3" });
});

// post contact router
router.post(
  "/contact",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email id"),
    check("mobile")
      .isLength({ min: 10 })
      .withMessage("Mobile  number must be atleast 10 characters")
  ],
  function(req, res) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      var messages = [];
      errors.errors.forEach(function(err) {
        console.log(JSON.stringify(err));
        messages.push(err.msg);
      });

      res.render("contact", {
        errors: true,
        messages: messages,
        fname,
        lname,
        mobile,
        email,
        comment
      });
    } else {
      // read the values and save it in the DB
      let fname = req.body.fname;
      let lname = req.body.lname;
      let mobile = req.body.mobile;
      let email = req.body.email;
      let comment = req.body.comment;

      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mLog");
        let d = new Date();
        let contact = {
          fname,
          lname,
          mobile,
          email,
          comment,
          date_created: d,
          date_modified: d
        };
        console.log(contact);
        dbo
          .collection("register")
          .insertOne(contact, function(err, registerObj) {
            if (err) throw err;
            console.log("1 document inserted. Id = " + registerObj._id);
            db.close();
          });
      });
      res.render("contact", { success: true, layout: "layout3" });
    }
  }
);
// contact router end
// subscribe rout
router.post('/subscribe',function(req,res){
  let email = req.body.email;
  console.log(email);
  if(email && email !== ''){
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      let dbo = db.db("mLog");
    
      let newsletter = {email};
      dbo.collection('newsletter').insertOne(newsletter, function(err, obj){
        if(err) throw err;
        // get the projects
        dbo.collection('projects').find({}).limit(3).toArray(function(err, projects){
          if (err) throw err;
          // console.log(JSON.stringify(projects));
          // get the posts
          dbo.collection('blog').find({}).limit(3).toArray(function(err, blog){
              if (err) throw err;
              // console.log(JSON.stringify(posts));
              db.close();
              res.render('index', {projects:projects,blogs: blog, success: true})
          })
        })
      })
    });
  }
}) 
// subscribe block end 

module.exports = router;
