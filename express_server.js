var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true

}));

//this if for our random string generator
function generateRandomString() {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var text = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
    let templateVar = {
        username: req.cookies["username"]
    }
    res.render("urls_index", templateVars)
});

//on our main url page, generates a new random id when we create a different page
app.post("/urls", (req, res) => {
    var id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect('/urls/' + id);
    console.log(urlDatabase);
});

// deletes the linked page
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect('/urls/');
})

app.get("/urls/:id", (req, res) => {
    console.log("inside id");
    let templateVars = {
        longURL: urlDatabase[req.params.id],
        shortURL: req.params.id,
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
    console.log(templateVars)
});

//cookie function

app.post("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
})
app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect('/urls')
})
app.get("/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect('/urls')
})

//when we get the new id we redirect to new
app.post("/urls/:id", (req, res) => {
    res.redirect('/urls/new');
})

app.post("/urls/:id/update", (req, res) => {
    var shortURL = req.params.id
    urlDatabase[shortURL] = req.body.newLongURL;
    res.redirect('/urls');
    //we are updating the the request link long URL 
})

//create a registration page
app.get("/registration", (req, res) => {  
      let templateVar = {
    username: req.cookies["username"]
};
    res.render('registration',templateVar); 
})

// app.post("/registration", (req, res) =>{
//     console.log(req.body.newUsername)
//     res.redirect('/urls')
// })


app.get("/u/:shortURL", (req, res) => {

    let shortURL = req.params.shortURL;
    console.log(shortURL);
    let longURL = urlDatabase[shortURL];
    res.redirect(longURL);
});