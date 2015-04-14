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

// creating the tables sequentially in the js rather than have sep schema and seed files
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS backpackers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT, image TEXT, background TEXT, info TEXT);");
	db.run("CREATE TABLE IF NOT EXISTS posts (p_id INTEGER PRIMARY KEY, p_title TEXT, p_image TEXT, p_body TEXT, b_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE TRIGGER timestamp_update BEFORE UPDATE ON posts BEGIN UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id; END;");
	db.run("CREATE TABLE IF NOT EXISTS comments (c_id INTEGER PRIMARY KEY, c_name TEXT, c_body TEXT, p_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE TRIGGER timestamp_update BEFORE UPDATE ON comments BEGIN UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id; END;");
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
			res.redirect("/backpackers");
		}
	});
});

// each backpacker page
app.get("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows) {
		res.render("show.ejs", {backpacker: rows});
	});
});

// form to make posts
app.get("/backpacker/:id/posts/new", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows) {
		res.render("new_post.ejs", {backpacker: rows})
	});
});

// to add a post 
app.post("/backpacker/:id/posts", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows) {
		db.run("INSERT INTO posts (p_title, p_image, p_body, b_id) VALUES (?, ?, ?, ?);", req.body.title, req.body.p_image, req.body.p_body, b_id, function (err) {
			if (err) {
				throw err;
			} else {
				res.redirect("/backpacker/"+b_id+"/posts");
			}
		});
	});
});

// all posts of one backpacker
app.get("/backpacker/:id/posts", function(req, res){
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows){
		db.all("SELECT * FROM posts WHERE b_id ="+b_id+";", function(err, rows2) {
			res.render("index_post.ejs", {backpacker : rows, posts : rows2});
		});
	});
});

// adding comments
app.post("/backpacker/:id/post/:p_id/comments", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	db.run("INSERT INTO comments (c_name, c_body, p_id) VALUES (?, ?, ?);", req.body.c_name, req.body.c_body, p_id, function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpacker/"+b_id+"/post/"+p_id);
		}
	});
});

// to delete a comment
app.delete("/backpacker/:id/post/:p_id/comment/:c_id", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	var c_id = parseInt(req.params.c_id);
	db.run("DELETE FROM comments WHERE c_id ="+c_id+";", function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpacker/"+b_id+"/post/"+p_id);
		}
	});
});

// each post page
app.get("/backpacker/:id/post/:p_id", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows){
		db.get("SELECT * FROM posts WHERE p_id = "+p_id+";", function(err, rows2) {
			db.all("SELECT * FROM comments WHERE p_id ="+p_id+";", function(err, rows3) {
				console.log(rows3);
				res.render("show_post.ejs", {backpacker : rows, post : rows2, comments: rows3});
			});
		});
	});
});

// backpacker edit form
app.get("/backpacker/:id/edit", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.get("SELECT * FROM backpackers WHERE id="+b_id+";", function(err, rows) {
			res.render("edit.ejs", {backpacker : rows});
	});
});

// to edit a backpacker and update the database
app.put("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.run("UPDATE backpackers SET name = ?, password = ?, image = ?, background = ?, info = ? WHERE id ="+b_id+";", req.body.name, req.body.password, req.body.image, req.body.background, req.body.info, function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpackers");
		}
	});
});

// each post's edit form
app.get("/backpacker/:id/post/:p_id/edit", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM backpackers WHERE id ="+b_id+";", function(err, rows){
		db.get("SELECT * FROM posts WHERE p_id = "+p_id+";", function(err, rows2) {
			res.render("edit_post.ejs", {backpacker : rows, post : rows2});
		});
	});
});

// editing a post 
app.put("/backpacker/:id/post/:p_id", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	db.get("SELECT * FROM backpackers WHERE id="+b_id+";", function(err, rows) {
		db.run("UPDATE posts SET p_title=?, p_image=?, p_body=?, b_id=? WHERE p_id="+p_id+";", req.body.title, req.body.p_image, req.body.p_body, b_id, function(err) {
			if (err) {
				throw err;
			} else {
				res.redirect("/backpacker/"+b_id+"/posts");
			}
		});
	});
});

// to delete a backpacker
app.delete("/backpacker/:id", function(req, res) {
	var b_id = parseInt(req.params.id);
	db.run("DELETE FROM backpackers WHERE id ="+b_id+";", function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpackers");
		}
	});
});

// to delete a post
app.delete("/backpacker/:id/post/:p_id", function(req, res) {
	var b_id = parseInt(req.params.id);
	var p_id = parseInt(req.params.p_id);
	db.run("DELETE FROM posts WHERE p_id ="+p_id+";", function(err) {
		if (err) {
			throw err;
		} else {
			res.redirect("/backpacker/"+b_id+"/posts");
		}
	});
});

app.get("/:somethingelse", function(req, res) {
	res.redirect("/backpackers");
});

app.get("/:somethingelse/:somethingelse", function(req, res) {
	res.redirect("/backpackers");
});

// listening on port 3000
app.listen(3000);
console.log("Listening on 3000");



