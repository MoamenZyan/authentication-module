#!/usr/bin/env node

const events = require('events');
const myEmitter = new events.EventEmitter();
const express = require('express');
const session = require('express-session');
const db = require('./database/db.js');
const classes = require('./functions/classes.js');
const tools = require('./functions/tools.js');
const path = require('path');
const app = express();
const PORT = "8080"; // Server Port

const api_key = "Your API Key"

// DATABASE Initialization
db.init();

// Session Management
app.use(session({
    secret: "123", // Your Sessions Secret
    saveUninitialized: true,
    resave: false,
    cookie: {
        path: "/"
    }
}));

// EJS Configurations
app.set('view engine', "ejs");
app.set('views', path.join(__dirname, "/static/html")); // HTML pages route


// MiddleWares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/static/css"))); // CSS files route
app.use(express.static(path.join(__dirname, "/static/js"))); // JS files route
app.use(express.static(path.join(__dirname, "/static/images"))); // Images route

// Pages Routes

// Root Page
app.get("/", (req, res) => {
    res.render("login.ejs");
});

// Signup Page
app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

// User Home Page
app.get("/:username/home", (req, res) => {
    if (req.session.user) {
        res.render("home.ejs", {user: req.session.user});
    } else {
        res.redirect("/");
    }
});

// Login API
app.post("/api/login", async (req, res) => {
    if (req.headers.api_key === api_key) {
        res.setHeader('Content-Type', 'application/json');
        const user = new classes.User(req.body);
        let result = await user.user_auth();
        if (result == 0) {
            const info = await user.to_obj();
            req.session.user = info['username'];
            req.session.cookie.path = `/${info['username']}/`;
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            res.status(200).json({code: 0, page: `/${info['username']}/home`});
        } else if (result == -2) {
            res.status(404).json({code: 1});
        } else {
            res.status(500).json({code: -1});
        }
    }
});

// Listening for the email secret code
myEmitter.on('Email Verification', (result, email) => {
    app._router.stack = app._router.stack.filter(layer => !layer.route || layer.route.path !== `/api/email/${email}`);
    const expirationTime = Date.now() + 60 * 6 * 1000;
    app.post(`/api/email/${email}`, (req, res) => {
        if (req.headers.api_key == api_key) {
            if (Date.now() <= expirationTime && Number(req.body['secret']) == result) {
                res.status(200).json({code: 0});
            } else {
                res.status(200).json({code: -1});
            }
        }
    });
});

// Check Unique Info
app.post('/api/user_info_check', async (req, res) => {
    if (req.headers.api_key == api_key) {
        const user = new classes.User(req.body);
        const result = await user.info_check();
        if (result == 0) {
            res.status(200).json({code: 0});
            const secret = await tools.sendSecret(req.body['email']);
            myEmitter.emit('Email Verification', secret, req.body['email']);
        } else if (result == 'username') {
            res.status(409).json({code: 1});
        } else if (result == 'email') {
            res.status(409).json({code: 2});
        } else if (result == 'phone') {
            res.status(409).json({code: 3});
        }
    }
});

// Signup API
app.post("/api/signup", async (req, res) => {
    if (req.headers.api_key == api_key) {
        const user = new classes.User(req.body);
        const result = await user.user_add();
        if (result === 0) {
            const info = await user.to_obj();
            req.session.user = info['username'];
            req.session.cookie.path = `/${info['username']}/`;
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            res.status(200).json({code: 0, page: `/${info['username']}/home`});
        } else if (result === -1) {
          res.status(500).json({code: -1});
        } else {
          res.status(409).json({code: result});
        }
    }
});


app.listen(PORT, () => {
    console.log(`This Server Is Running On Port ${PORT}`);
});
