const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const factory = require("./../controllers/factoryController");
const AppError = require("./../utils/appError");

const catchAsync = (asyncFunction) => {
    return (request, response, next) => {
        asyncFunction(request, response, next).catch(error => {
            next(error);
        });
    }
}

exports.getCheckoutSession = catchAsync( async(request, response, next) => {
    // 1) Getting the wanted tour :
    const tour = await Tour.findById(request.params.tourId);

    // 2) Creating the chechout session :
    // const session = await
  

    // 3) Sending it to the clint :

    response.status(200).json({
        status: "success",
        session
    });
});

/*
Google Pay API allows you to accept payments from your customers using their Google Pay accounts
Stripe
PayPal
Braintree

*/

// preventing any user of writing a review for tours they haven't booked
exports.checkIfBooked = catchAsync( async(request, response, next) => {
    const booking = await Booking.findBy({user: request.user.id, tour: request.body.tour});
    if (booking.length === 0) return next(new AppError('You must buy this tour to review it', 401));
    next();
});