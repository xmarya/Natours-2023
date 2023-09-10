const express = require("express");
const {
  logInOrNot,
  getOverview,
  getTourDetails,
  getLoginForm,
  userProfile,
  getSignupForm,
  getMyBookings
} = require("../controllers/viewsController");
// const { updateProfile } = require("../public/js/updateProfile.js");
const { protect } = require("../controllers/authController");
const router = express.Router();

/*
    طريقة الكتابة هذي هي نفسها نفس ما تعودت عليه لحد الآن
    أول شي اليو آر إل الي في هذي الحالة يكون الروت
    و بعدها الهاندلر ميدلوير بس اللهم ما حطيته في ملف ثاني و كتبت اسمه هنا
    عل طول حطيت الريكويست و الريسبونس
    هنا استخدمنا ريندر بدل جيسون لأننا نبغى نسوي ريندر للصفحة
    غير إن هذا راوت صفحات
    router.get("/", (request, response) => {
        // node will know where to look for this file -base- because we've defined the path of it in app.js.
        response.status(200).render("base", {
          // in order to pass data into this template,
          // we have to define an object and put the data we want,
          // which are going to be available in the template .
          tour: "The Forest Hiker",
          user: "Marya"
        }); 
      });
*/
router.get("/", logInOrNot, getOverview);
router.get("/tour/:slug", logInOrNot, getTourDetails);
router.get("/signup", getSignupForm, getOverview); // redirect the user to the home page to login after finishing the signing up process .
router.get("/login", logInOrNot, getLoginForm);
router.get("/myProfile", protect, userProfile); // we used protect md here because we want it to be a protected route
// note that it's not a protected template so logInOrNot md isn't the one we should have used
/*
    The protect middleware is to ensure that the user needs authorization or special privilege in order to perform certain operations.
    The isLoggedIn is just to ensure that the user needs to be logged in in order to access certain routes or perform certain operations.
*/

router.get("/myBookings", protect, logInOrNot, getMyBookings);
// router.post("/submit-user-data", protect, noJSUpdateProfile);

// router.post("/submit-user-data", protect, updateProfile);
module.exports = router;
