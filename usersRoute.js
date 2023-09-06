const express = require("express");
const {getAllUsers, getUser, myProfile, createUser, updateMyData, updateMyPhoto, updateUserByAdmin, deleteMyAccount} = require(`${__dirname}/controllers/usersController`);
const {protect, restrict, signup, login, logout, forgetPassword, resetPassword, updateMyPassword} = require(`${__dirname}/controllers/authController`);
// const {deleteOldPhotos} = require("./utils/deleteOldPhotos");
// const multer = require("multer");
// const upload  = multer({dest: "public/img/users"});

// create a new router and save it to a variable, then we will use it instead of app:
const router = express.Router();

/*
its not necessary in case of the /signup to add a route method 
cause we ae not going to add any more verbs like get or/and patch etc 
with the/signup route. Unlike the '/' route or /:id  route
*/
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout); // it's get because we're not sending any data .
// ^ signup and login are only valid with post() .

router.post("/forgetPassword", forgetPassword);
router.patch("/resetPassword/:randomToken", resetPassword); // its patch because the result of this route will be the modefication of the password property in the user's document .

router.use(protect);
                        // this md will fake the id to be like it's coming from the url. then it will be passed to getUser.
router.get("/myProfile", myProfile, getUser);

router.patch("/updateMyPassword", updateMyPassword);
router.patch("/updateMyData", updateMyPhoto, updateMyData);
router.delete("/deleteMyAccount", deleteMyAccount);

router.route("/").get(getAllUsers).post(restrict("admin"), createUser);
router.route("/:id").get(getUser).patch(restrict("admin"), updateUserByAdmin);

module.exports = router;
