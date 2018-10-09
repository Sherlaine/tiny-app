let express = require("express");
let app = express();
let PORT = 8080; // default port 8080
let cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');



// ---------------------------------> Body parser 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true

}));

app.use(cookieSession({
    name: "session",
    keys: ["whatever you want"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hour expiration
}))

//---------------------------------> Configure 
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));


//-------------------------------> User examples
const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("1", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("1", 10)
    }

}

//--------------------------> Databases examples   urls.shorturl.userId
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



//-----------------------------> random string function
function generateRandomString() {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    let text = '';
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


// ----------------------------> Paths 
app.get("/", (req, res) => {
    res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});


//-------------------------------> Main page

app.get("/urls", (req, res) => {
    var user = users[req.session["user_id"]]
    if (user !== undefined) {
        let templateVars = {
            urls: urlDatabase,
            user: user
        };
        res.render("urls_index", templateVars);
        return;
    } else {
        res.status(400);
        res.send("Please login or register");
    }
});

//-------------------------------> Random URL to database 
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let urlTemplate = {
        userId: users[req.session.user_id].id,
        longURL: longURL
    }
    urlDatabase[shortURL] = urlTemplate;
    res.redirect(`/urls/${shortURL}`);
});

// -------------------------------> New URL Page

app.get("/urls/new", (req, res) => {
    for (let key in users) {
        if (users[req.session["user_id"]] === users[key]) {
            let templateVars = {
                user: users[req.session["user_id"]]
            };
            res.render("urls_new", templateVars);
            return;
        }
    }
    res.redirect('/login');
});

//-------------------------------> Short URL Page

app.get("/urls/:id", (req, res) => {
    if (req.params.id in urlDatabase) {
        let templateVars = {
            shortURL: req.params.id,
            longURL: urlDatabase[req.params.id].longURL,
            user: users[req.session["user_id"]]
        };
        res.render("urls_show", templateVars);
    } else {
        let templateVars = {
            shortURL: req.params.id,
            user: users[req.session["user_id"]]
        };
        res.redirect("urls_new", templateVars);
    }
});

//-----------------------------> Deletes the linked page
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls/');
})

// ------------------------------> Updates the short URL
app.post("/urls/:id/update", (req, res) => {
    var shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect('/urls');
})


// --------------------------------> Reads the short URL
app.get("/u/:shortURL", (req, res) => {
        if (req.params.shortURL in urlDatabase){
            let longURL = urlDatabase[req.params.shortURL].longURL;
            res.redirect(longURL);
    } else {
        res.status(400);
        res.send("Please login or register");
    }
});


//------------------------> Registration page
app.get("/register", (req, res) => {
    res.render('register');
})

app.post("/register", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let newUserID = generateRandomString();

    //functions to validate user's email and password
    for (let property in users) {
        if (email === users[property].email) {
            res.status(400).send("Existing user email, please register");
            return;
        }
    }

    if (!email || !password) {
        res.status(400);
        res.send("Please supply email and password");
        return;
    }
    let hashedPassword = bcrypt.hashSync(password, 10)

    // adds the new user
    users[newUserID] = {
        id: newUserID,
        email: email,
        password: hashedPassword
    }

    // new cookie for user 
    req.session["user_id"] = newUserID;
    res.redirect('/urls');
})

//--------------------------------> Login 

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    let loginEmail = req.body.email;
    let loginPassword = req.body.password;
    for (let object in users) {
        let user = users[object];
        if (loginEmail && user.email === loginEmail && bcrypt.compareSync(loginPassword, user.password)) {
            req.session["user_id"] = user.id;
            res.redirect("/urls");
            return;
        }
    }

    res.status(403);
    res.send("Password and email not valid");
});

// -----------------------------> Logout 
app.post("/logout", (req, res) => {
    req.session = null;
    console.log("Logout successful");
    res.redirect('/');
})

//------------------------------> Loads the app 

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});