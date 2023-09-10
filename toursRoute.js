const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  uploadTourImages,
  resizeTourImages,
  deleteTour,
  topTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getAllDistances
} = require(`${__dirname}/controllers/toursController`);

const {protect, restrict} = require("./controllers/authController");
const reviewsRoutr = require("./reviewsRoute");
// const bookingRouter = require("./Routes/bookingsRoute");

// create a new router and save it to a variable, then we will use it instead of app:
const router = express.Router();

// specify the parameter we want to search for in the URL to run this middleware:
/* 
    router.params() is not the middleware, but the callback function inside of it 
    is the actual middleware. It is called as soon as the "id" parameter is revealed
    in that last router("/:id"). The router.params() is set up beforehand to listen for this revelation.
    that's why router.param("id", checkId); is written before router.route().
*/

/*
!!! NO NEED FOR THIS !!!

router.param('id', checkId);
router.route('/').get(getAllTours).post(checkBody,createTour);


    POST /tour/12765126/reviwes
    GET tour/12765126/reviews
    GET tour/12765126/reviews/9845313
// router.route("/:tourId/reviews").post(protect, restrict("user"), writeAReview);
*/


router.use("/:tourId/reviews", reviewsRoutr);
// router.use("/:tourId/bookings", bookingRouter);

// creating AGGR query's route
router.route("/tour-stats").get(getTourStats);

// creating ALASING for top best and cheapest tours:
router.route("/top-five-tours").get(topTours,getAllTours);

router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/tours-within/:distance/centre/:latlng/unit/:unit").get(getTourWithin);
router.route("/distances/:latlng/unit/:unit").get(getAllDistances);

router.route('/').get(getAllTours).post(protect, restrict("admin", "lead-guide"), createTour);
router.route('/:id').get(getTour)
.patch(protect, restrict("admin", "lead-guide"), uploadTourImages, resizeTourImages, updateTour)
.delete(protect, restrict("admin", "lead-guide"), deleteTour);


module.exports = router;
