'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan')
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt-nodejs');
const PORT = process.env.PORT || 8080;
const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static('public'));
// app.use(cookieParser("some_secret"));
app.use(cookieSession({
  name: 'session',
  keys: ["totally secret stuff"],
}));



app.set("view engine", "ejs");


let urlDatabase = {
  // "b2xVn2": {userId: 1, url: "http://www.lighthouselabs.ca"},
  // "9sm5xK": {userId: 1, url: "http://www.google.com"},
  // "a0iijM": {userId: 1, url: "http://www.noisli.com"}
};

let users = {
  // "RandomUserID": {
  // id: "someId",
  // email: "someemail@email.com",
  // password: "somePassword"
  // }
};

function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// loops through all ids and check if the email is the same as the email provided
// in the login form (compares entry email with the database, fetches ID).
const findIdUsingEmail = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const findEmailUsingID = function (id) {
  for (let user in users) {
    if (users[user].id === id) {
      return users[user].email;
    }
  }
};

const checkIfUserExists = (email, password) => {
  for (let user in users){
    if(users[user].email === email) {
      if(bcrypt.compareSync(users[user].password === password)) {
        return true;
      }
    }
  }
  return false;
};


const checkEmailsDouble = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};


app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// gets user's urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.session.user_id,
    email: findEmailUsingID(req.session.user_id)
  };

    if(!req.session.user_id) {
      res.statusCode = 401;
      res.send("<html><body>Please <a href=\"/login\">login</a> first.</body></html>")
    } else {
        res.statusCode = 200;
        res.render("urls_index", templateVars)
    }
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.session.user_id,
    email: findEmailUsingID(req.session.user_id)
  };

    if(req.session.user_id) {
    res.statusCode = 200;
    res.render("urls_new", templateVars);
  } else {
    res.statusCode = 401;
    res.send("<html><body>Please <a href=\"/login\">login</a> first.</body></html>");
  }
});


app.post("/urls/make", (req, res) => {
  // function that adds a new shortURL to my URLDatabase
  let shortURL = generateRandomString();
const data = {
  url: req.body.longURL,
  userId: req.session.user_id
};
urlDatabase[shortURL] = data;
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let keyToDelete = req.params.shortURL
  delete urlDatabase[keyToDelete];
  res.redirect("/urls")
});


app.get("/u/:shortURL", (req, res) => {
  let shortURL =req.params['shortURL'];
  let longURL = urlDatabase[shortURL].url;
  res.redirect(longURL);
});


// display my data, make a get request to urls_show
app.get("/urls/:id", (req, res) => {
  let data = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    updatedURL: req.params.id,
    email: findEmailUsingID(req.session.user_id)
  };

  if(!req.session.user_id){
    res.statusCode = 401;
    res.send("<html><body>Please <a href=\"/login\">login</a> first.</body></html>");
  }
  if (urlDatabase[req.params.id] && req.session.user_id) {
    res.statusCode = 200;
    res.render("urls_show", data);
  } else if (!urlDatabase[req.session.user_id].url[req.params.id]) {
    res.statusCode = 403;
    res.send("This link isn't associated with your user name.")
  }
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  res.render("urls_login");
});


app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
      res.status(400)
      res.send("Please enter an email & password.");
    } else if (!checkIfUserExists(req.body.email, req.body.password)){
      res.status(400)
      res.send("Can't find this user. Maybe you need to <a href=\"register\">register</a>?")
    }
    let userId = findIdUsingEmail(req.body.email);
    req.session.user_id = userId;
    res.redirect("/");
  });


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});


app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/");
  } else {
    res.status(200);
    res.render("urls_register");
  }
});


app.post("/register", (req, res) => {
  const password = bcrypt.hashSync(req.body.password);
  const email = req.body.email;
  const userID = generateRandomString();

    if (password === "" || email === "") {
      res.status(400);
      res.send("Please enter an email & password");
    } else if (checkEmailsDouble(email)) {
      res.status(400);
      res.send("You're already registered with this email.")
    }

  req.session.user_id = userID;

  users[userID] = {
    id: userID,
    email: email,
    password: password
    };
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
