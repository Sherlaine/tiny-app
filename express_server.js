var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));

function generateRandomString() {
      //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var text = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
// console.log(generateRandomString());

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
        urls: urlDatabase
    };
    res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.post("/urls", (req, res) => {
    var id = generateRandomString();
    urlDatabase[id] = req.body.longURL;

    res.redirect('/urls/'+id);

    console.log(urlDatabase);
    // console.log(req.body); // debug statement to see POST parameters
    // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// deletes the link page
app.post("/urls/:id/delete", (req, res) =>{
    delete urlDatabase[req.params.id] 
    res.redirect('/urls/');
})


app.post("/urls/:id", (req, res) =>{
    res.redirect('/urls/new');
})

app.post("/urls/:id/update", (req, res) =>{
    var shortURL = req.params.id 
    urlDatabase[shortURL] = req.body.newLongURL;

    res.redirect('/urls');
    //we are updating the the request link long URL 
})

app.get("/urls/:id", (req, res) => {
    console.log("inside id");
    let templateVars = {
        longURL: urlDatabase[req.params.id],
        shortURL: req.params.id
    };
    res.render("urls_show", templateVars);
    console.log(templateVars)
});

app.get("/u/:shortURL", (req, res) => {

    let shortURL = req.params.shortURL;
    console.log(shortURL);
    let longURL = urlDatabase[shortURL];
    res.redirect(longURL);
});