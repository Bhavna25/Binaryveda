const jwt = require("jsonwebtoken");
const User = require("./user_model");

// this middleware will be used for authenticating and validating tokens from the header
const authenticate = async (req, res, next) => {
    try {
        const retrieved_token =  req.cookies['access_token']; // getting the token from the header in request
        const decoded = jwt.verify(retrieved_token, 'SecretToken'); // verifying the signature of the retrieved token using the public key secret 
        const user = await User.findOne({ // find the user associated with the token using token _id which matches the user _id
            _id: decoded._id,
            'JWTtokens.token': retrieved_token
        });
        if (!user) {
            throw new Error("failed to authenticate user");
        } else {
            req.user = user;
            next();
        }
    } catch (e) {
        res.status(401).send({ "message": "Please authenticate" });
    }
}

module.exports = authenticate;