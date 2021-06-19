const express = require("express");
const User_Router = express.Router();
require("./mongodb_connection");
const User = require("./user_model");
const authenticate = require("./authentication");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const validator = require("validator");




User_Router.get("/", async (req, res) => {
    res.render('index');
});

User_Router.get("/login", async (req, res) => {
    res.render('login');
});

// Sign up / create new user route
User_Router.post('/users', async (req, res) => {
    const data = req.body;
    const user = new User(data);

    try {
        if(!validator.isEmail(user.email)){
            res.send({message: "choose a valid email"})
        } else {
            const exists = await User.findOne({email: data.email});
            if(exists) {
                res.send({message: "choose a different email this one is already taken"})
            } else {
                if(user.password.length < 6){
                    res.send({message: "password must be atleast 6 characters"});
                } else {
                    user.password = await bcrypt.hash(user.password, 8);
                    const generate_token = jwt.sign({_id: user._id.toString()}, 'SecretToken'); // generate new token using jwt library
                    user.JWTtokens = user.JWTtokens.concat({token : generate_token}); // adds the object to tokens array
                    res.cookie('access_token', generate_token);
                    await user.save();
                    res.render('dashboard', {message: "user created", name: user.name})
                }
            }
        }
    } catch (e) {
        res.status(500).send({ message: "Server error" });
    }
});


// login user
User_Router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) {
            res.status(200).send({message: "user not found "});
        } else {
            const isMatch = await bcrypt.compare(req.body.password, user.password); // compare the password inputed by the user model password
            if(!isMatch){
                res.status(200).send({message: "wrong password"});
            } else {
                const generate_token = jwt.sign({_id: user._id.toString()}, 'SecretToken'); // generate new token using jwt library
                user.JWTtokens = user.JWTtokens.concat({token : generate_token}); // adds the object to tokens array
                res.cookie('access_token', generate_token);
                await user.save();
                res.status(200).render("dashboard", {message: "login successful", name: user.name});
            }
        }
    } catch (e) {
        res.status(500).send({ message: "Server error" });
    }
});


// ROUTES THAT REQUIRE AUTHENTICATION read, update, delete profiles using  their jwt and verifying it.

// get the user details of an authenticated user
User_Router.get("/users/profile", authenticate, async (req, res) => {
    res.render('dashboard',{message: "authentication successful / getting user data", user: req.user});
});

// deleting the authenticated user profile
User_Router.get("/users/profile/delete", authenticate, async(req, res) => {
   
    try{
        await User.findByIdAndDelete({_id: req.user._id}); 
        res.status(200).redirect('/login');
      

    } catch (e){
        res.status(500).send({message:"server error, deletion faild"});
    }
   

});

// send the user data to a form in order for the user to update it on the client side
User_Router.get("/users/profile/updateForm", authenticate, async (req, res) => {
    res.render("updateForm", { user: req.user});
});

// update user data
User_Router.post('/users/profile/update', authenticate, async(req, res) => {
    const hashedPassword =  await bcrypt.hash(req.body.password, 8);
    const updated_data = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: req.body.password ? hashedPassword : req.user.password
    }
    try{
        const user_to_be_updated = await User.findByIdAndUpdate({_id: req.user._id}, updated_data);
        await user_to_be_updated.save();
        res.status(200).render('dashboard', {message: "authentication successful / updated user info"});

    } catch(e) {
        res.status(500).send({message:"server error, failed to update data"});
    }
});

// logout route that deletes all of the tokens in the JWTtoken array
User_Router.post("/users/profile/logout", authenticate, async (req, res) => {
    try{
        req.user.JWTtokens = [];
        await req.user.save();
        res.status(200).redirect("/login");

    } catch (e){
        res.status(500).send({message:"server error, failed to logout"});
    }
    

});


module.exports = User_Router;