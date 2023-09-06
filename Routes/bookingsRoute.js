const express = require("express");
const { getCheckoutSession } = require("./../controllers/bookingsController");
const { protect } = require("./../controllers/authController");

const router = express.Router();

router.get("/checkout-session/:tourId", protect, getCheckoutSession); 
// this one will not follow the REST princeble because it's not about geeting or updating or creating any bookings,
// it is for the client ti get a checkout session.

module.exports = router;