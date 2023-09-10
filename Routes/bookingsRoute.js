const express = require("express");
const { addNewBooking, getAllBookings, getCheckout } = require("./../controllers/bookingsController");
const { protect, restrict } = require("./../controllers/authController");


const router = express.Router({mergeParams: true});
router.post("/checkout/:tourId", protect, restrict("user"), getCheckout);
module.exports = router;