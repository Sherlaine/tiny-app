let express = require("express");
let app = express();
let PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser')


app.set("view engine", "ejs");

app.use(cookieParser())

//-------------------------------users
const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "1"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "1"
    }
}

//--------------------------databases
let urlDatabase = {
    "b2xVn2": {
        userId: "userRandomID",
        longURL: "http://www.lighthouselabs.ca",
    },

    "9sm5xK": {
        userId: "userRandomID2",
        longURL: "http://www.google.com",
    }
};

// ---------------------------------body parser 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true

}));

//----------this if for our random string generator
function generateRandomString() {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    let text = '';
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


// ---------------------------- Paths 
app.get("/", (req, res) => {
    res.redirect('/login');
});



app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});


//------------------------------- Reads page

app.get("/urls", (req, res) => {
    if (req.cookies["user_id"]) {
        let templateVars = {
            urls: urlDatabase,
            user: users[req.cookies["user_id"]]
        };
        res.render("urls_index", templateVars);
        return;
    } else {
        res.send("Please login or register")
    }
})

//------------------------------- Random URL to database 
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let urlTemplate = {
        userId: users[req.cookies.user_id].id,
        longURL: longURL
    }
    urlDatabase[shortURL] = urlTemplate;
    res.redirect('/urls/${shortURL}');
});

// ------------------------------- New URL Page

app.get("/urls/new", (req, res) => {
    for (let key in users) {
        if (users[req.cookies["user_id"]] === users[key]) {
            let templateVars = {
                user: users[req.cookies["user_id"]]
            };
            res.render("urls_new", templateVars);
            return;
        }
    }
    res.redirect("/login");
});

//------------------------------- Short URL Page

app.get("/urls/:id", (req, res) => {
    if (req.params.id in urlDatabase) {
        let templateVars = {
            shortURL: req.params.id,
            longURL: urlDatabase[req.params.id].longURL,
            user: users[req.cookies["user_id"]]
        };
        res.render("urls_show", templateVars);
    } else {
        res.render("urls_new");
    }
});

//----------------------------- deletes the linked page
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect('/urls/');
})

// -------------------------------Updates the short URL
app.post("/urls/:id/update", (req, res) => {
    var shortURL = req.params.id
    urlDatabase[shortURL] = req.body.newLongURL;
    res.redirect('/urls');
    //we are updating the the request link long URL 
})
//when we get the new id we redirect to new
app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id].longURL = longURLUpdated;
    res.redirect('/urls/${req.params.id}');
})


// -------------------------------- Reads the short URL
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});


//------------------------ Registration page
app.get("/register", (req, res) => {

    res.render('register');
})

app.post("/register", (req, res) => {
    //assigning our email and password variable with the user's inuput of email and password
    let email = req.body.email;
    let password = req.body.password;
    let newUserID = generateRandomString();

    //we are making a newUSER ID by generating a random string 
    for (let property in users) {
        if (email === users[property].email) {
            res.status(400).send("Existing user email, please register")
            return;
        }
    }

    if (!email || !password) {
        console.log("400 need something in here")
        res.status(400).send("Please supply email and password");
        return;
    }
    // adds the new user
    users[newUserID] = {
        id: newUserID,
        email: email,
        password: password
    }

    // new cookie for user 
    res.cookie("user_id", newUserID);
    console.log(users)
    res.redirect('/urls')
})

//--------------------------------login 

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    for (let object in users) {
        const user = users[object];
        if (email && user.email === email && user.password === password) {
            res.cookie("user_id", user.id);
            res.redirect("/urls");
            return;
        }
    }
    res.status(403).send("Password and email not valid");
});

// -----------------------------logout 
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect('/')
})

//------------------------------Loads the app 

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});