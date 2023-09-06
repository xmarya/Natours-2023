const AppError = require("../utils/appError");
const User = require("./../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const factory = require("./factoryController");
const {deleteOldAvatar} = require("../utils/deleteOldPhotos");

const catchAsync = (asyncFunction) => {
  return (request, response, next) => {
    asyncFunction(request, response, next).catch((error) => {
      // console.log(error);
      next(error);
    });
  };
};

exports.getAllUsers = factory.getAll(User);

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined :(",
  });
};

exports.getUser = factory.getOne(User);

const filterOut = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((element) => {
    // this how to loop over an obj.
    if (allowedFields.includes(element)) filteredObj[element] = obj[element];
  });

  return filteredObj;
};

exports.myProfile = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

// multer is a md for handlig multi-part form data,
// which they're a form encoding that used to upload files from a form .
// 1) Creating a multer storage :

const multerStorage = multer.diskStorage({
  destination: (request, file, cb) => {
    // we can't define the dest here like we didi in upload because the dest here accepts a cb function which has am access to the current request, current uploaded file, and another cb function which is exactly like the next() in express.
    cb(null, "public/img/users");
  },
  filename: (request, file, cb) => {
    // here where we define the format of naming the photo .
    // the best format is acombination of : user-id-currenttimestap.extension
    // 1) Extracting the file extension from the uploaded file :
    const extension = file.mimetype.split("/")[1]; // because its image/jpeg. you can see it by console request.file
    cb(null, `user-${request.user.id}-${Date.now()}.${extension}`);
  },
}); // to store the file as its in our file system which is the public


// استبدلنا الملتر ستوريج الأول بهذا لأنه بيكون أحسن و لو حفظنا الملف في الميموري بفر المؤقت دام إننا بنغير السايز حقه
// بدل ما نحفظ الصورة بشكل دائم في ملف الببلك في الهاردسك و بعدها نروح نغير في اعدادات الصورة لمن نستخدم شارب
// const multerStorage = multer.memoryStorage();

// 2) Creatin a multer filter (to test if the uploaded file is really an image):
const multerFilter = (request, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
    
  }
  return cb(new AppError(400, `The only accepted files are images, please select an image ${request.file} file tyep: ${file.mimetype}`), false);

};

// const upload = multer({dest :"public/img/users"}); THE OLD ONE, I'm keeping it for the sake of the explainnation I've written above .
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.updateMyPhoto = upload.single("photo");
  
/*
    هنا سوينا كوفيقيوريشن لملتر ميدلوير و ألحقناها بأبلود
    الأبلود هذا راح يكون مسؤول عن أخذ الملفات و ينسخها للديستنيشن الي عرفناه بداخله
    كمان راح يضيف للريكويست الملف الي أخذه أو معلومات عنه 
    لكن المشكلة الصورة لمن تنرفع ماراح تنرفع بالإمتداد المطلوب لأنه بيغير اسمها وقت الرفع 
*/

exports.resizePhoto = catchAsync (async(request, response, next) => {

  // 1) Checking if there is an uploaded file, If not ? go to the next md :
  if (!request.file) return next();

  // 2) Resizing :
  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;
  /*
        because right now this .filename is not defined.
        So, when we decide to save the image into memory const multerStorage = multer.memoryStorage();
        so as a buffer, the filename will not really get set yet,
        but we really need that filename in our other middleware functions,
        So that's down in updateMyData() .
        So we rely on request.file.filename
        in order to save the filename into our database.


        */
  await sharp(request.file.buffer)
    .resize(500, 500, { fit: sharp.fit.inside, withoutEnlargement: true })
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`public/img/users/${request.file.filename}`);

  next();
});


exports.updateMyData = catchAsync(async (request, response, next) => {
  // to display the file we uploaded using multer:
  // console.log("updateMyData INSIDER 1 "+ request.file);

  // 1- Thorwing an error if the user trys to POST password data:
  if (request.body.password || request.body.confirmPassword)
    return next(
      new AppError(400, "You can't update your password here. Please go to Update my Password tab."));

  // 2- Preventing any other db's properties to get updated:
  const filteredBody = filterOut(request.body, "name", "email");
  if (request.file) filteredBody.photo = request.file.filename; // we just want the name of the photo to the doc in our db, not the entire path.

  // 3- Updating the user's doc:
  const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, { new: true, runValidators: true });
  if (!updatedUser)
    return next(new AppError(404, "no User was found with the specifed ID :("));

  deleteOldAvatar(updatedUser);
  response.status(200).json({
    status: "success",
    updatedUser,
  });
});

exports.updateUserByAdmin = factory.updateOne(User);

exports.deleteMyAccount = catchAsync(async (request, response, next) => {
  const deletedUser = await User.findById(request.user.id).select("+password");
  const confirmEmail = request.body.confirmEmail;
  const confirmPassword = request.body.confirmPassword;

  if (
    confirmEmail !== deletedUser.email ||
    !(await request.user.comparePassword(confirmPassword, deletedUser.password))
  )
    return next(
      new AppError(400, "Email or password is incorrect, Please try again.")
    );

  await User.findByIdAndDelete(deletedUser.id);

  response.status(204).json({
    status: "success",
    message: "the specific user was deleted successfully",
  });
});
