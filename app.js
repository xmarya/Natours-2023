const express = require("express");
const app = express();
const morgan = require("morgan"); // allows us to see request data in concole
const AppError = require("./utils/appError");
const tourRouter = require(`${__dirname}/toursRoute`);
const userRouter = require(`${__dirname}/usersRoute`);
const reviewRouter = require("./reviewsRoute");
const bookingRouter = require("./Routes/bookingsRoute");
const errorController = require("./controllers/errorController");
const rateLimit = require("express-rate-limit"); // wa want it to be a global md that's why we put it here in app.js .
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp"); // stands for http parameter pollution .
const path = require("path"); // a native built-in module, no need to install .
const viewRouter = require("./Routes/viewsRoute");
const cookieParser = require("cookie-parser"); // in order to get access to the cookies that are inside the request .

const compression = require("compression");
const cors = require("cors");
// 1) telling express which template engine we are going to use:
app.set("view engine", "pug");

// 2) define the location of our views:
app.set("views", path.join(__dirname, "views"));

// deifne routers for static files using this mw which allows us to access to our file system:
// (bu using express.static we baisacally have defined that all the static assets wil always automatecally be served from a folder called public)
// MORE ABOUT THIS AT LEC.177 *THE FIRST STEPS WITH PUG* around time 6:43
app.use(express.static(path.join(__dirname, "public")));

/*
console.log(process.env.NODE_ENV);

^ this conlog will print undefined because in server.js
  I put dotenv.config({path: `${__dirname}/config.env`});
  under const app = require(`${__dirname}/app`);
  and this means we required and runed the app before our NODE_ENV
  variables are read
*/

// this fun will be called and returns a md to be used here instead of her .
app.use(helmet({ contentSecurityPolicy: false })); // setting securty hp header .
/*
  any md shouldn't ba called inside app.use(),
  but here helmet is an exception that's why it has the calling brackets .
*/

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 60, // #requests per hour.
  windowMs: 60 * 60 * 100, // the calculation of 1 hour.
  message: "We've got too many requests from this IP, Try again after 1 hour",
});

app.use("/api", limiter); // to affect all of the routes that starts with /api .

/*
  THIS SECTION IS FOR :
     Body parser (reading the data from the body into request.body)
*/
app.use(express.json({ limit: "15kb" })); // middleware which is a function used to modify the incoming requests' data.
// the middleware is a step the request goes through while it's been processed . // this middlewars is for ALL of the routes. and limit opt means the api won't accept and data is larger than 15kb.

app.use(cookieParser()); // the above line parsers the data from the body, this line parses the data from the cookies .

/* 
  For Data sanitisation, after the previous md reads the data we want to clean it
  in oreder to prevent 2 types of attacks, which they are:
  1) NoSQL query injuction.
  2) XSS
*/
app.use(mongoSanitize()); // this fun will be called and returns a md to be used here instead of her .

/*
    HOW MOGNOSANITIZE() WORKS ?
    what this middleware does is
    to look at the request body, the request query string,
    and also at Request.Params, and then it will basically filter out
    all of the dollar signs and dots, because that's how MongoDB operators are written.
    By removing that, well, these operators are then no longer going to work.
*/

app.use(xssClean()); // clean the user input from any malicious html code .

app.use(
  hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "price"],
  })
);
/*  for ex: if we defined 2 more parameters of sort (sort by duration and sort by price) that will crush our api
because we're not prepared for recieving mare than one parameters of the same type of fields */

app.use(compression()); // it's going to return a md function which job is compression all the test that is send to the client -images are not included because they are already compressed-


app.use(cors()); // is going to return a md to set different headers to our response.
// which allow other requests no matter where they came from to access the whole api resources.
// we also can just specify one route to be accessible like this:
// app.use("/api/v1/users", cors(), userRouter).
// BUT this is just the first step of implementing cors
// here we just allowd the simple requests (GET and POST)
// so we have to implement it for the non-simple requests (PUT, PATCH, DELETE, requests that send cookies and requests that uses non-standard headers).
// NSRs require a so-called preflight phase, which issues by the browser automatically.
// let's say we have a DELETE request, before this request actually happens
// the browser does an OPTION request in order to figure out whether the DELETE request is safe to send or not,
// so as developers we need to respond to that OPTION request .
app.options("*", cors()); // OPTION is another HTTP method like GET, POST.. etc.
// and here we applied it to all of our routes .



// define a route :
/**
 routing means basically to determine
 how an application responds to a certain
 client request, so to a certain URL.
    1) app.TheMethodWeWantToResponseTo("url",CB);
    2) you may specify the status before sending.
 */

// A) ROUTE OF TMPLATE PAGES - Rendring Pages:
app.use("/", viewRouter);

// B) ROUTE OF API -
// connect the new router with our app by using it as a middleware : (this step is called mount router)
app.use("/api/v1/tours", tourRouter); // this middlewars is for TOURS route.
app.use("/api/v1/users", userRouter); // this middlewars is for USERS route.
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// errors handler md from express :
app.use(errorController);

// creaing a route handler for all routes that was not catched by our handlers :
app.all("*", (request, response, next) => {
  // all means all of the verbs and * means all types of HTTP methods (get, post,patch,delete).
  // response.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${request.originalUrl} on the server :( !`
  // });
  // next();
  /*
    when next() recieved an argument, no matter what it is, 
    express will know immedetally there'a an error.
     whenever we pass anything into next, 
     it will assume that it is an error, and it will
     then skip all the other middlewares in the middleware
     tack and sent the error that we passed in to 
     our global error handling middleware,
  */

  next(
    new AppError(404, `Can't find ${request.originalUrl} on the server :( !`)
  );
});

module.exports = app;
