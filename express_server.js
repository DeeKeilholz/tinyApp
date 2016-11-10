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


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "a0iijM": "http://www.noisli.com"
};



function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
   res.redirect("/urls/b2xVn2");
});

app.get("/login", (req, res) => {
  let username = {username: false}
  res.render("urls_login", username)
})

app.post("/login", (req, res) => {
  let username = req.body.username
  res.cookie("username", username, {signed: true})
  res.redirect("/")
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/")
})

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// GET is for reading
app.get("/urls/new", (req, res) => {
  const username = req.signedCookies.username
  res.render("urls_new", username)
});


app.get("/urls", (req, res) => {
  const username = req.signedCookies.username
  let templateVars = {
    urls: urlDatabase,
    username: username
  };
  res.render("urls_index", templateVars);
});

// make a request: enter a long URL into the form field and update the longURL
// in my database
// get a response from the server that redirects me to /urls and displays the short URL
// with the new longURL
app.post('/urls/:shortURL/update', (req, res) => {
  var editedURL = req.body.editedURL
  urlDatabase[req.params.shortURL] = editedURL;
  res.redirect("/urls");
});

//database = {key: "value"}
//database["key"] = "new value"

// display my data, make a get request to urls_show
app.get("/urls/:shortURL", (req, res) => {
  const username = req.signedCookies.username
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let keyToDelete = req.params.shortURL
  delete urlDatabase[keyToDelete];
  res.redirect("/urls")
});


app.get("/urls/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
