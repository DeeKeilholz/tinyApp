const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));




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

//renders my urls.ejs which gives me a list of all short and longURLs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls", templateVars);
});

// renders my urls_new ejs file which gives me a page where I can enter any URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// setting short URL to my randomString function, passing shortURL to my database
// so that a random string is created and setting it to the longURL I'm entering in my
// form field in urls_new.ejs
// redirecting to urls/whateverthenewshortURL is
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


//adds the newly created shortURL to my path and renders "index"(the new shortURL
// and my longURL)
app.get("/urls/:shortURL", (req, res) => {
 let templateVars =
 { shortURL: req.params.shortURL,
   longURL: urlDatabase[req.params.shortURL]
 };
 res.render("index", templateVars);
});

//redirects from /u/shortURL to the actual website (longURL)
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// deletes a key out of my database using the form I set up in urls.ejs
app.post("/urls/:shortURL/delete", (req, res) => {
  let keyToDelete = req.params.shortURL
  delete urlDatabase[keyToDelete];
  res.redirect("/urls")
});


app.post('/urls/:shortURL/update', (req, res) => {
  var editedURL = req.body.editedURL
  urlDatabase[req.params.shortURL] = editedURL;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// app.post("/urls", (req, res) => {
//   console.log(req.body);  // debug statement to see POST parameters
//   res.redirect('/urls/:id')
//   //res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });
