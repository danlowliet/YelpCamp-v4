const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      Campground = require("./models/campground"),
      Comment = require("./models/comment"),
      seedDB = require("./seed")

seedDB()
mongoose.connect("mongodb://localhost/yelp_camp")
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")


//landing page route
app.get("/", function (req, res) {  
    res.render("landing")
})

//campgrounds page route
//INDEX ROUTE
app.get("/campgrounds", function (req, res) {  
    //get all campground from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds})
        }
      })
})


//post route
//CREATE - add new campground to DB
app.post("/campgrounds", function (req, res) {  
    //get data from form and add to camps array
    let name = req.body.name
    let image = req.body.image
    let desc = req.body.description
    let newCampground = {name: name, image: image, description: desc}
    //Create a new campground and save to database
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect to camps page
            res.redirect("/campgrounds")
        }
      })
})

//NEW - show form to create new campground
app.get("/campgrounds/new", function (req, res) {  
    res.render("campgrounds/new")
})

//SHOW - shows more info about the one campground
app.get("/campgrounds/:id", function (req, res) {
    //find the with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground})
        }
    })
})

//=========================
// COMMENTS ROUTE
//=========================

app.get("/campgrounds/:id/comments/new", function (req, res) {  
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) {  
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground})
        }
    })
})

app.post("/campgrounds/:id/comments", function (req, res) {
    //lookup campground using id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        } else {
            //create new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    campground.comments.push(comment)
                    campground.save()
                    res.redirect("/campgrounds/" + campground._id)
                }
            })
            //connect new comment to campground
            //redirect campground/show page
        }
    })
})


app.listen(3000, function () {  
    console.log("YELPCAMP SERVER HAS STARTED");
})


