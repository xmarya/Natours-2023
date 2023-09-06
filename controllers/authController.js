const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const {promisify} = require("util");
const Email = require("./../utils/email");
const crypto = require("crypto");

const catchAsync = (asyncFunction) => {  
  return (request, response, next) => {
    asyncFunction(request, response, next).catch((error) => {      
      next(error);
    });
  };
};

const signature = (id) => {
  // payload, secretKey, [options, cb]
  return jwt.sign({ id }, process.env.AUTH_KEY, {
    expiresIn: process.env.KEY_EXPIRING_TIME,
  });
};


const tokenWithCookies = (response, token) => {
  const cookieOpt = {
    // converting the 1d in .env to miliseconds.
    expires: new Date(Date.now() + process.env.COOKIE_EXPIREING_TIME * 24 * 60 * 60 * 1000),
    secure: false, // true means the cookie will only be send on an encrybted connection (https). By the way, this wouldn't work because we're not using https so the cookies will not be created and be sent to the client. To get around this we're going to deactivate this opt and only activate it in production by make the whole opt a variable like this.
    httpOnly: true, // means the cookie can't be accessed or modified in anyway by the browser in client's machine which help us avoiding the XSS attacks. but this
                // will make us face a problem when implementing logout functionality, so to solve this without losing one of our security pieces
                // we're going to create a route for logout and send back via it a cookie with the exact same name but without the token
                // and that is going to overwrite the current cookie in the browser .
  }

  if(process.env.NODE_ENV === "production") cookieOpt.secure = true;
            //(cockie's name, data we want to send in the cookie, opts for cookie)
  response.cookie("jwt", token, cookieOpt);
}

// I've decided to put the logout in this file because is more related to Authentication affairs than the view.
exports.logout = (_, response) => {
  response.clearCookie("jwt");
  response.status(200).json({status: "success"});
};

exports.signup = catchAsync(async (request, response, next) => {
  // to not make all signingup users an admin, we will write the create method like this:
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role
  });
  // ^ so, this way of creating a new user will prevent any other data or rule to be stored into the new user.
  
  // const url = `http://localhost:8080/myProfile`;
  const url = `${request.protocol}://${request.get("host")}/myProfile`;

  await new Email(newUser, url).sendWelcome();
  const token = signature(newUser._id);

  tokenWithCookies(response, token);
  /*
    Why sending token in the response body of new user ?
    all we need to do to log in a new user,because right now we're not checking
    if any password is correct or if the user actually exists in the database
    because here in this case, the user was really just created,
    and so right away, we logged user into the application by sending a token
  */
  response.status(201).json({
    status: " success",
    token,
    data: {
      user: newUser,
    },
  });

});

exports.login = catchAsync(async (request, response, next) => {
  
  const { email, password } = request.body;

  // 1- checking email and pawword :
  if (!email || !password)
    return next(new AppError(400, "Please provide your email and password to login !"));

  // 2- checking if the user is exists and the entered data match with db data or not :
  const user = await User.findOne({ email }) // we're using findOne not ById because in the situation we're not selecting a user by its id but with user's email .
    .select("+password"); // لأن الباس باي ديفولت نوت سيليكتيد في السكيميا اخترناها بصراحة هنا لأننا في حالة تسجيل الدخول نحتاج نشيك عليها مثل الايميل
    
  // 3- okay? send the token to the user:
  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError(401, "Incorrect email or password !"));
  
  const token = signature(user._id);
  tokenWithCookies(response, token);
  response.status(200).json({
    status: "success",
    token
  });
});


exports.protect = catchAsync (async (request, response, next) => {

  // 1- Geeting the token + check if it exists or not :
    // reading the token that was sent it in the header of the request .
  let token ;
  // authenticate the user from the headers
  if(request.headers.authorization && request.headers.authorization.startsWith("Bearer"))
  token = request.headers.authorization.split(" ")[1]; // getting the token at second index of the array .

  // OR authenticate the user from the cookies
  else if (request.cookies.jwt) token = request.cookies.jwt;
    
    

  if(!token) {
    if(request.originalUrl.startsWith("/myProfile")) return response.redirect("/"); // this if() to prevent user go back to a protected route after logging out.
    return next(new AppError(401, "You must login to see the contents"));
    }
    // 2- Verification token :
    /*
    The promisify() function will return a Promise version of your function , so
    Example :   const verify =  promisify(jwt.verify)  <=>  verify now is the promise version of jwt.verify.
    
    ======================================================
    
    when we call a function we call it by the () after it including the arguments if any, without that it will not run in place without being called  by an event later as the case with the handlers in router for example.
    so think of (token, process.env.JWT_SECRET) as the actual calling of the function  before it.
    now promisify(jwt.verify) is a function that needs to be called, otherwise it's not called.
    so we should use promisify(jwt.verify)(token, process.env.JWT_SECRET);
    */
   
   // ألحين promisify(jwt.verify) تًعتبر فنكشن و القوس الي بعدها هو النداء الي بداخل الباراميترز حقها
   const payload = await promisify(jwt.verify)(token, process.env.AUTH_KEY);
  //  console.log(payload);
   
   
   // 3- checking if user still exists:
   const currentUser = await User.findById(payload.id); // one of the payload contents is the id, that's why we have an access to it .
   console.log(currentUser);
   
   if(!currentUser) return next(new AppError(401, "this user is no loger exist"));

  // 4- checking if user changed his password after the token had issued :
  if (currentUser.changedPasswordAfter(payload.iat))// iat => issued at
    return next(new AppError(401, "This User has recently changed the password, Please log in again :)"));
  
  /* this one for the API */ request.user = currentUser; // travel the data of this user to the next md. this line is important for getting the role at next step in restrict md.
  /* this one for the myProfile route template response.locals.user = currentUser;*/ 
  
  // this next() will only be performed after the 4 steps to grant access to the protected routes.
  next();
});


/*
لأن الميدل وير ما تقبل براميترز غير  الثلاثة المعرفة و هنا احنا في هذي الحلة لابد نرسل ايش نوع اليوزر بالإضافة في الريكويست و الريسبونس و النيكست
ف كحل لهذي المشكلة راح نسوي رابر فنكشن تستقبل نوع اليوزر و بداخل هذي الفنكشن راح نرجع الميدل وير
بهذي الطريقة راح نستخدم نوع اليوزر الي هو البراميتر الأصلي الفنكشن مع البراميترز المعتادي لأي ميدل وير بما إنها صارت فنكشن فرعية
*/
exports.restrict = (...roles) => {
  return((request, response, next) => {
    // roles[admin, lead-guide]       role[user, guide]
    if(!roles.includes(request.user.role)) {
      return next(new AppError(403, "you don't have the premission to perform this action"));
    }
    next();
  });
}

// forgettPassword will be a post from user
exports.forgetPassword = catchAsync(async (request, response, next) => {
  // 1- Getting user based on POSTed email :
  const user = await User.findOne({email: request.body.email});
  if(!user) return next(new AppError(404, "There is no user with this email"));
  
  // 2- Generating A RANDOM TOKEN not a jwt token .
    const randomToken = user.randomToken(); 
    //  احنا في الانستانس ميثود الي سوت راندوم توكين عدلنا بس على البيانات لكن ما حفظناها في الدوكيومنت, عشان كذا هنا بنسوي عملية الحفظ. لكن لو رحنا لبوست مان و سوينا بوست لرواتر فورقيت باسوورد راح يطلع لنا خطأ مثل الخطأ الي يطلع لمن نسجل يوزر جديد ببيانات ناقصة
    /*
    we're trying to save a document, but we do not specify all of the mandatory data,
    so the fields that we marked as required. Let's quickly fix that.
    All we need to do is to actually pass a special option into this user dot save method.
    */
    await user.save({validateBeforeSave: false});
    
  // 3- Sending it to user's email:
  // هنا بنرسل لليوزر التوكين الأصلي الغير مشفر و نقارنه بالمشفر
  const resetURL = `${request.protocol}://${request.get("host")}/api/vi/users/resetPassword/${randomToken}`;
  // const text = `Write your new password and confirm it by clicking here: ${resetURL} \n Please ignore this email if you didn't forget your password :)♥`;
  // here we're using a try-catch block to send the error if any happens to the client, we don't want dealing with the error using our errorHandler beacause it's not enough, we need to do more than that.
  try {
  //   await Email({
  //   email: user.email,
  //   subject: "Reset Password for your account at Natours",
  //   text,
  // });
    await new Email(user, resetURL).sendResetPassword();
  response.status(200).json({
    status: "success"
  });

  } catch(error) {
    user.passwordResetToken = undefined;
    passwordResetExpires = undefined;
    await user.save();

    return next(new AppError(500, "An error has happend while sending the reset password email to the user ... Please try again"))
  }
});
exports.resetPassword = catchAsync(async (request, response, next) => {

  // 1- Getting the user based on the token (hashing he token that was sent to the user and comparing it with the one was stored in the db):
  const hashedToken = crypto.createHash("sha256").update(request.params.randomToken).digest("hex");
  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}}); // this line will find the specific user and check the token availability at once, if the time expired then will return a false to the next if() .

  // 2- Setting the new password ONLY IF THE TOKEN TIME HASN'T EXPIRED AND THE USER IS EXIST:
  if(!user) return next(new AppError(400,"Reset passowrd's link has expired"));

  // 3- Updating passwordChangedAt property:
  user.password = request.body.password; // because we're sending the password and its confirm via the body .
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken, user.passwordResetExpires = undefined // delete them .
  await user.save(); // here we didn't turn off the validator, on contrary we want to validate the the password and its confirm are matching .

  // 4- Loging the user in (Sending JWT to the user):
  const token = signature(user._id);
  tokenWithCookies(response, token);
  response.status(200).json({
    status: "success",
    token
  });
});

// هذي الفنكشن مالها علاقة بالثنتين الي فوق, هذي تسمح لليوزر يغير الباس و هو ألريدي مسوي لوق إن, يعني ما نسيها
exports.updateMyPassword = catchAsync( async (request, response, next) => {

  // 1- Getting the user from collection:
  // هنا اخذنا المعلومات باستخدام ريكويست.يوزر.آيدي لأن المعلومات هذي متوفرة لنا آلريدي من ميدلوير بروتيكت, فما يحتاج نستخدم ريكويست.بارامز.آيدي
  const user = await User.findById(request.user.id).select("+password");
  console.log(user);
  
  // 2- Confirming if the user actually is who he says he is by asking to provide the current password:
  const providedPassword = request.body.currentPassword;
  
  if(!(await user.comparePassword(providedPassword, user.password)))
    {
      console.log("INSIDE COMPARING IF()");
      
      return next(new AppError(401, "The provided password does not match the current one. Please make sure to write it correctly"));}
  
  // 3- Okay? update the password:
  user.password = request.body.newPassword;
  user.passwordConfirm = request.body.confirmNewPassword;
  await user.save();

  // 4- Loging the user in (Sending JWT to the user):
  const token = signature(user._id);
  tokenWithCookies(response, token);

  response.status(200).json({
    status: " success",
    token
  });
});


