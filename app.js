
 // npm i passport passport-local passport-local-mongoose express-session

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

// console.log(process.env.SECRET);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userScheme = new mongoose.Schema({
	email: String,
	password : String
});



userScheme.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userScheme);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//TODO
app.get("/", function(req,res){
	res.render("home");
})

app.get("/login", function(req,res){
	res.render("login");
})

app.get("/secrets", function(req,res){
	if(req.isAuthenticated()){
		res.render("secrets")
	}else{
		res.redirect("/login")
	}
});

app.get("/register", function(req,res){
	res.render("register");
})

app.post("/register", function(req,res){

	User.register({username:req.body.username}, req.body.password, function(err, user) {
  if (err) { 
    	console.log(err);
    	res.redirect("/register")
     }
     else{
  		passport.authenticate("local") (req,res,function(){
  			console.log("successfully redirect")
  			res.redirect("/secrets");
  		});
  			
    


    // Value 'result' is set to false. The user could not be authenticated since the user is not active
  }
});


})

app.post("/login", function(req,res){

	const user = new User({
		username :req.body.username,
		password :req.body.password
	})
	req.login(user, function(err){
		if(err){
			console.log(err)
		}else{

				passport.authenticate("local") (req,res,function(){
  			console.log("successfully redirect")
  			res.redirect("/secrets");
  		});

		}
	})
	
})

app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/")
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});