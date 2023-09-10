const Review = require("../models/reviewModel");
const factory = require("./factoryController");



const catchAsync = asyncFunction => {
    return (request, response, next ) => {
        asyncFunction(request, response, next ).catch (error => {
            console.log(error);
            next(error);
        });
    }
}

exports.getAllReviews = catchAsync(async (request, response, next) => {
    let filter = {}
    if(request.params.tourId) filter = { id: request.params.tourId };

    const reviews = await Review.find(filter);

    response.status(200).json({
        result: reviews.length,
        reviews
    });
});

exports.setTourUser = (request, response, next) => {
    // these two if()s are for allowing nested routes :
    if(!request.body.tour) request.body.tour = request.params.tourId;
    if(!request.body.writer) request.body.writer = request.user.id; // this peice of info is available inside protect md .
    next();
}

exports.checkOwner = catchAsync( async(request, response, next) => {
    const review = await Review.findById(request.params.id);
    if (request.user.role !== "admin") {
      if (review.user.id !== request.user.id) 
      return next(new AppError(403, `You cannot edit someone's else review.`));
    }
    next();
  });

exports.writeReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
