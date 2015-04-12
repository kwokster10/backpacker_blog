// requiring all the necessary modules
var express = require("express");
var app = express();
var ejs = require("ejs");
// setting app directory for files to views
app.set("view_engine", "ejs");
var sqlite3 = require("sqlite3").verbose();
// setting the database to store and get information
var db = new sqlite3.Database("blog.db");

// creating the tables sequentially in the js rather than have sep schema and seed files
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS backpackers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, background TEXT, info TEXT);");
	db.run("CREATE TABE IF NOT EXISTS posts (p_id INTEGER PRIMARY KEY, p_body TEXT, p_image TEXT, b_id INTEGER); CREATE TRIGGER timestamp_update BEFORE UPDATE ON posts BEGIN UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;");
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

app.get("/backpackers/new", function(req, res) {
	res.render("new.ejs");
});

app.post("/backpackers", function(req, res) {
	db.run("INSERT INTO backpackers (name, image, background, info) VALUES (?, ?, ?, ?);", req.body.name, req.body.image, req.body.background, req.body.info, function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpackers");
		}
	})
});


// listening on port 3000
app.listen(3000);
console.log("Listening on 3000");



