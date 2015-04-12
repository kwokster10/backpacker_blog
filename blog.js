var express = require("express");
var app = express();
var ejs = require("ejs");
app.set("view_engine", "ejs");

app.get("/", function(req, res){ 
	res.redirect("/backpackers");
});

app.get("/backpackers", function(req, res){
	db.all("SELECT * FROM backpackers;", function(err){
		res.render("index.ejs");
	});
});



app.listen(3000);
console.log("Listening on 3000");