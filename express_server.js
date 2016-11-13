'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
// const cookieSession = require('cookie-session')
const PORT = process.env.PORT || 8080;
const app = express();


app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieSession({ keys: 'session' }));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(cookieParser("some_secret"));



app.set("view engine", "ejs");


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "a0iijM": "http://www.noisli.com"
};

let users = {"uniqueId": {
  id: "uniqueId",
  email: "abc@def.com",
  password: "123",
}}
// loops through all ids and returns the user information and then we check
// in the information if the email is the same as the email provided in the
// login form (compares entry email with the database)
const findIdUsingEmail = function (email) {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
}

function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
  if(req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.get("/urls", (req, res) => {
    if(!req.cookies.user_id) {
      res.statusCode = 401;
      res.redirect("/login")
    } else {
      let templateVars = {
        userID: req.cookies.user_id,
        email: users[req.cookies.user_id].email,
        users: users,
        urls: urlDatabase }
      res.statusCode = 200;
      res.render("urls_index", templateVars)
    }
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookie.user_id
  res.render("urls_new", userID)
});

// display my data, make a get request to urls_show
app.get("/urls/:shortURL", (req, res) => {
  const userID = res.cokie.user_id
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/update', (req, res) => {
  var editedURL = req.body.editedURL
  urlDatabase[req.params.shortURL] = editedURL;
  res.redirect("/urls");
  // redirect /urls/id ??
});

app.get("/login", (req, res) => {
  let email = {email: false};
  let templateVars = {
  userID: req.cookies.user_id
  }
  if(req.cookies.user_id) {
  res.redirect("/");
  }
  res.statusCode = 200;
  res.render("urls_login", email)
  })

app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", userID);
  res.redirect("/")
})

app.post("/login", (req, res) => {
  const email = req.body.email
  const userId = findIdUsingEmail(email);
  res.cookie("user_id", userId);
  res.redirect("/")
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  let keyToDelete = req.params.shortURL
  delete urlDatabase[keyToDelete];
  res.redirect("/urls")
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
