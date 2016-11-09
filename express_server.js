const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");




function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "a0iijM": "http://www.noisli.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
 let templateVars =
 { shortURL: req.params.id,
   longURL: urlDatabase[req.params.id]
 };
 res.render("index", templateVars);
});

app.post("/urls/:id", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// app.get("/urls/:id", (req, res) => {
//  let templateVars =
//  { shortURL: req.params.id,
//    longURL: urlDatabase[req.params.id]
//  };
//  res.render("urls", templateVars);
// });

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// Respond with a redirection to http://localhost:8080/urls/<shortURL>,
// where <shortURL> indicates the random string you generated to represent the original URL.


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// app.post("/urls", (req, res) => {
//   console.log(req.body);  // debug statement to see POST parameters
//   res.redirect('/urls/:id')
//   //res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });
