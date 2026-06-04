const jwt = require("jsonwebtoken")
const SECRET_KEY = "your_secret_key";

const verifyToken =(req,res,next)=>{
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader)
    const bearerToken = bearerHeader.split(" ")
    const token = bearerToken[1];
    console.log(token,"Token")
    if(!bearerHeader){
        return res.status(403).json({message:"Token required"})
    }
     jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;