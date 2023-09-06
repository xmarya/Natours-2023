const AppError = require("./../utils/appError");

const errorDevelopment = (error, request, response) => {
  // we don't wamt to send any programming errors details to the user so we breaked the response into if else blocks .
  // the original URL is the entire URL but without the hostname part,
  //  so it looks like the route that is why we could use startWith() for testing.
  if (request.originalUrl.startsWith("/api")) {
    // for API
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
    });
  }
    // it's not a programming related error so we want to render it to the page for the users.
    return response.status(error.statusCode).render("error", {
      // for rendered website
      title: "Somthing went wrong",
      msg: error.message,
    });
};

/*
  لاحظي إنه دائمًا ما نكتب قبل الريسبونس كلمة ريترن,
 لكن هنا في هذا الحالة لأن الريسبونس داخل بلوكات إف-إيلس و عندنا أكثر من ريسبونس
 ف بدون الريترن البرنامج احتمال يسوي رن لأكثر من ريسبونس و هذا الشي
 بيطلع لنا إيرور لأن أي ريسبونس راح ينهي دائرة حياة ريكويست-ريسبونس
  و طبعًا نفس الشي يصير مع نيكست() لمن تكون داخل بلوك
*/
const errorProduction = (error, request, response) => {
  
  if (request.originalUrl.startsWith("/api")) {
    // for API
    // we don't wamt to send any programming errors details to the user so we breaked the response into if else blocks .
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        error,
      });
    } else {
      return response.status(500).json({
        status: "error",
        message: "errorProduction: something went wrong",
        error,
      });
    }
  }

  if (error.isOperational) {
    return response.status(error.statusCode).render("error", {
      // for rendered website
      title: "Somthing went wrong",
      msg: error.message,
    });
  }
  // here is for handling the errors that come from view or client related stuff .
  return response.status(error.statusCode).render("error", {
    title: "Somthing went wrong",
    msg: "Please try again later",
  });
};

const dbCastErrorHandler = (error) => {
  const message = `dbCastErrorHandler: Invalid ${error.path}: ${error.value}`;
  return new AppError(400, message);
};

const dbDuplicateKeyHandler = (error) => {
  // this type of error does't have a name property because it wasn't caused by mongoose but by mongoDB driver , so, we're going to use code property .
  const message = `dbDuplicateKeyHandler: Duplicated field value: (${error.keyValue.name}) Please use another value .`;
  return new AppError(400, message);
};

const dbValidationErrorHandler = (error) => {
  // Object.values used to loop over an object of arrayes or then map to loop over the array itself .
  const allErrorsMesgs = Object.values(error.errors).map(
    (element) => element.message
  );
  const message = `dbValidationErrorHandler: Invalid input data. ${allErrorsMesgs.join(
    ". "
  )}`;
  return new AppError(400, message);
};

const jwtInvalidToken = () => {
  return new AppError(
    401,
    "jwtInvalidToken: Something is wrong ! please try to logout and login again ♥"
  );
};

const jwtTokenExpiredError = () => {
  return new AppError(
    401,
    "jwtTokenExpiredError: Something is wrong ! please try to logout and login again ♥"
  );
};

module.exports = (error, request, response, next) => {
  // console.log(error.stack); // shows us where has the error's happened .

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    errorDevelopment(error, request, response);
  } else if (process.env.NODE_ENV === "production") {
    // console.log("INSIDE MODULE.EXPORTS if(production) " + error.name);
    // dealing with mongoose errors .
    if (error.name === "CastError") error = dbCastErrorHandler(error); // these type of errors will be marked as isOperational .

    if (error.code === 11000) error = dbDuplicateKeyHandler(error);

    if (error.name === "ValidationError")
      error = dbValidationErrorHandler(error);

    if (error.name === "JsonWebTokenError") error = jwtInvalidToken();

    if (error.name === "TokenExpiredError") error = jwtTokenExpiredError(error);

    errorProduction(error, request, response);
  }
  // next(); // maybe no need for next() here because this md is the last one to be excuted in md stack.
};
