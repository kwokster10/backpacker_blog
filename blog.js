// requiring all the necessary modules
var express = require("express");
var app = express();
var ejs = require("ejs");
// setting app directory for files to views
app.set("view_engine", "ejs");
// need this to read body of req
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
// need this for put and delete
var metOverride = require("method-override");
app.use(metOverride("_method"));

var sqlite3 = require("sqlite3").verbose();
// setting the database to store and get information
var db = new sqlite3.Database("blog.db");

var pic_default = "http://30.media.tumblr.com/tumblr_kyhg91fBOQ1qzlucko1_500.jpg";
var background_default = "http://www.aamrofreight.net/wp-content/uploads/2014/06/White-Background-Wallpapers-HD.jpg";

// creating the tables sequentially in the js rather than have sep schema and seed files
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS backpackers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT, image TEXT, background TEXT, info TEXT);");
	db.run("CREATE TABLE IF NOT EXISTS posts (p_id INTEGER PRIMARY KEY, p_body TEXT, p_image TEXT, b_id INTEGER); CREATE TRIGGER timestamp_update BEFORE UPDATE ON posts BEGIN UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;");
	db.run("CREATE TABLE IF NOT EXISTS comments (c_id INTEGER PRIMARY KEY, c_name TEXT, c_body TEXT, p_id INTEGER); CREATE TRIGGER timestamp_update BEFORE UPDATE ON comments BEGIN UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;");
});

// redirecting to my main page
app.get("/", function(req, res){ 
	res.redirect("/backpackers");
});

// my main page; making this a blog for backpackers with things to say
app.get("/backpackers", function(req, res){
	db.all("SELECT * FROM backpackers;", function(err, rows){
		res.render("index.ejs", {backpackers : rows});
	});
});

// form for new backpacker
app.get("/backpacker/new", function(req, res) {
	res.render("new.ejs");
});

// creating new backpacker
app.post("/backpackers", function(req, res) {
	db.run("INSERT INTO backpackers (name, password, image, background, info) VALUES (?, ?, ?, ?, ?);", req.body.name, req.body.password, req.body.image, req.body.background, req.body.info, function(err) {
		if (err) {
			throw err;
		} else {
			console.log(req.body);
			res.redirect("/backpackers");
		}
	});
});

// each backpacker page
app.get("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id, function(err, rows) {
		console.log(rows);
		res.render("show.ejs", {backpacker: rows});
	});
});

// backpacker edit form
app.get("/backpacker/:id/edit", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id="+b_id, function(err, rows) {
			res.render("edit.ejs", {backpacker : rows});
	});
});

// to edit a backpacker and update the database
app.put("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.run("UPDATE backpackers SET name = ?, password = ?, image = ?, background = ?, info = ? WHERE id ="+b_id, req.body.name, req.body.password, req.body.image, req.body.background, req.body.info, function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpackers");
		}
	});
});

// to delete a backpacker
app.delete("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.run("DELETE FROM backpackers WHERE id ="+b_id, function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpackers");
		}
	});
});

// listening on port 3000
app.listen(3000);
console.log("Listening on 3000");



