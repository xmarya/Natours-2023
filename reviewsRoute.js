const express = require("express");
const { getAllReviews, writeReview, setTourUser, deleteReview, updateReview, checkOwner } = require("./controllers/reviewController");
const { checkIfBooked } = require("./controllers/bookingsController");
const { protect, restrict } = require("./controllers/authController");


/*
    لأن بالأساس كل راوتر عنده وصول للباراميترز حقت راوتاته فقط, 
    لكن لمن نفعل خيار ميرج بارامز راح نقدر نوصل لباراميترز الرواترات الثانية
    في هذي الحالة إحنا فعلنا الخيار هذا عشان نوصل للتور آيدي
    يعني ألحين لو كان الراوت:
    POST /tour/12765126/reviwes (the code related to this is in tourRoute.js)
    أو
    POST /reviews
    راح يتم استخدام الكود الي تحت
*/
const router = express.Router({ mergeParams: true });

router.route("/").get(getAllReviews).post(protect, restrict("user"),setTourUser,  writeReview);
router.route("/:id").patch(protect, restrict("user", "admin"), updateReview).delete(protect, restrict("user", "admin"), checkOwner, deleteReview);
module.exports = router;