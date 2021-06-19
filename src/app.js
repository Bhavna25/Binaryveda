const express = require("express");
require("./mongodb_connection");
const User_Router = require('./user_router');
const app = express();
var cookieParser = require('cookie-parser'); // module for parsing cookies


const path = require("path");
const viewsPath = path.join(__dirname, '/templates/views');
const public_dir = path.join(__dirname, '/public');

app.use(express.json());
app.use(cookieParser());

app.use(express.static(public_dir));
app.use(express.urlencoded({
    extended: true
}));

app.set("view engine", "hbs");
app.set('views', viewsPath);

app.use(User_Router);

const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log("server is up and running on port " + port);
});