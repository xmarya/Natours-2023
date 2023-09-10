const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const factory = require("../controllers/factoryController");
const AppError = require("../utils/appError");

const catchAsync = (asyncFunction) => {
    return (request, response, next) => {
        asyncFunction(request, response, next).catch(error => {
            next(error);
        });
    }
}

exports.addNewBooking = catchAsync( async(request, response, next) =>{
    // const tour = await Tour.findById(request.params.tourId);
    // const user = await User.findById(request.user.id);
    // request.body = {tour, user};
    const newDoc = await Booking.create(request.body);
    
    response.status(201).json({
        status: "success",
        newDoc
    });
});

exports.getCheckout = catchAsync( async(request, response, next) => {   
    const tour = await Tour.findById(request.params.tourId);
    const user = await User.findById(request.user.id);
    await Booking.create({tour, user});    
    response.status(201).json({
        status: "success",
    });
    

});

exports.getAllBookings = catchAsync( async(request, response, next) => {
    const bookings = await Booking.find();

    response.status(200).json({
        status: "success",
        result: bookings.length,
        bookings
    });
});

// preventing any user of writing a review for tours they haven't booked
exports.checkIfBooked = catchAsync( async(request, response, next) => {
    const booking = await Booking.findBy({user: request.user.id, tour: request.body.tour});
    if (booking.length === 0) return next(new AppError('You must buy this tour to review it', 401));
    next();
});
