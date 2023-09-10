const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const catchAsync = (asyncFunction) => {
  return (request, response, next) => {
    asyncFunction(request, response, next).catch((error) => {
      next(error);
    });
  };
};

// this md's goal IS NOT RELETED TO PROTECT ROUTES,
// it's for protect rendring some pieces of the templates
// so there will be no error to be thrown in this one .
exports.logInOrNot = catchAsync(async (request, response, next) => {
  // if (request.cookies.jwt !== "Bye, God bless you.") {
    // instead approache is to use try-catch with return nex(); inside the catch block, note that no need to hanlde the error in this md.
    if(!request.cookies.jwt) return next();
    
    if (request.cookies.jwt) {
      const payload = await promisify(jwt.verify)(request.cookies.jwt, process.env.AUTH_KEY);

      const currentUser = await User.findById(payload.id); // one of the payload contents is the id, that's why we have an access to it .
      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(payload.iat)) return next();

      // if the token has verified + if the user exists + if the password hasn't changed
      // then that means there's a logged in user and what we have to do in this case
      // is to grant that user the access to our template
      response.locals.user = currentUser;
      /*
      ريسبونس.لوكالز تخلي التيمبليت يوصل للفيريبل الي نعطيها هو, مثلها مثل
      ما نعطي الفيريبلز للريندر() ميثود 
      بس لازم يكون الفيريبل الي بعد لوكالز له نفس مسمى الفيريبل الي يكون متاح
      ألريدي داخل التمبليت (؟) مني متأكدة من المعلومة الأخيرة
    */
      return next();
    }
    // return next();
  // }
  next(); // if there in no cookie this one is going to be used .
});

exports.getOverview = catchAsync(async (request, response, next) => {
  // 1) Getting all the tours data from collection :
  const tours = await Tour.find();

  // 2) Buidling the Template :
  // it's in overview.pug

  // 3) Injecting the data into the Template then Rendring it :

  response.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTourDetails = catchAsync(async (request, response, next) => {
  console.log("getTourDetails ViewsController INSIDER");
  
  // 1) Getting the data of selected tour (including reviews and guides):
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    select: "text writer rating",
  });

if (!tour) return next(new AppError(404, "No tour with this name"));

// User can only book a tour once :
if (response.locals.user) { // here we applied the same logic for request.user when the user information is provided by the protect md
                            // but in this case, the user information is available inside the response.locals because be passed the current user inside logInOrNot md
    const bookings = await Booking.find({ user: response.locals.user.id }); // 1) Getting this particular user data from booking DB .
    // console.log("1 ", bookings);
    
    
    const tourIDs = bookings.map(el => el.tour); // 2) Extracting the tours from the user data
    // console.log("2 ", tourIDs);
    
    
    const userBookedTour = await Tour.find({ _id: { $in: tourIDs } });
    // console.log("3 ", userBookedTour);
    
    
    if (userBookedTour) {
      console.log("4 ", userBookedTour);
      
      userBookedTour.forEach(bookedTours => {
        if (bookedTours.id === tour.id) {
          response.locals.alreadyBooked = true; // passing this new variable to pug.
        }
      });
    }
  }
  
  // 2) Building the Template :
  
  // 3) Injecting the data into the Template then Rendring it :
  
  response.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getSignupForm = (_, response) => {
  response.status(200).render("signup", {
    title: "Signup"
  })
}

exports.getLoginForm = (_, response) => {
  response.status(200).render("login", {
    title: "Login",
  });
};

exports.userProfile = catchAsync(async (request, response, next) => {
  response.status(200).render("profile",{
    title: "My profile",
    user: request.user
  });
});

exports.getMyBookings = catchAsync( async(request, response, next) => {
  // 1) Finding all the tours of the currently logged in user has booked :
  const bookings = await Booking.find({user: request.user.id});

  // 2) Finding the tours based on the ids we got from the logged in user :
  const tourIds = bookings.map(element => element.tour); // here, no nedd to specify it like this "element.tour.id" because the tour itself is an id .
  const tours = await Tour.find({ _id: {$in: tourIds}}); // here, we didn't use findById because we needed a new operator .
  
  response.status(200).render("overview",{
    title: "My bookings",
    tours
  });
});
