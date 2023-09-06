// const fs = require("fs");
const Tour = require("./../models/tourModel");
const AppError = require("../utils/appError");
const {deleteOldImages} = require("../utils/deleteOldPhotos");
const factory = require("./factoryController");
const multer = require("multer");
const sharp = require("sharp");

/*
!!! NO NEED FOR THIS !!!

// read the json obj and convert it to an array of JS objs.
const tours = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json"));

*/
/*
!!! NO NEED FOR THIS !!!

exports.checkId = (request, response, next, value) => {
    if(+(value) > tours.length) {
        return response.status(404).json({
            statur: "fail",
            message: "invalid id"
        });
    }
    next(); // withou the return above, the code will continue to excute the next() and go the other middleware with an invalid parameter value
}

exports.checkBody = (request, response, next) => {
    
    if(!request.body.name || !request.body.price) {
        return response.status(400).json({
            status: "fail",
            message: "please reenter the data correctly"
        });
    }
    
    next();
}
*/



/*
Adam's answer in lec:116:
  So let's deconstruct it:
  We know that route handlers/middleware in Express need to take in a function 
  and that function gets called with the (req, res, next) arguments and we want to make it async, so we can do:
  app.get('/myroute', async (req, res, next) => {
      ...
  })

  So that works and I can do this for every route. 
  However, now I'll have to handle each error inside of the async function using try/catch everywhere 
  and I'll have to do that for every route. How can I clean this up? Well since async functions return Promises, 
  I know I can add a .catch() block to it, but I need to be able to pass next to the catch block. The only way to do that is with closures:
  const myFunc = async (req, res, next) => {
      ...
  })
  app.get('/myroute', (req, res, next) => {
      myFunc(req, res, next).catch(next)
  })

  Now when an error occurs, our .catch() block will catch it and call next() with the error. 
  The next problem is that I need to generalize this so I can pass in any function I want so we wrap it in yet another function:
  const catchAsync = fn => {
      return (req, res, next) => {
          fn(req, res, next).catch(next)
      }
  }
*/

const catchAsync = asyncFunction => {
  return (request, response, next) => {
    asyncFunction(request, response, next).catch(error => {
      // console.log(error);
     next(error)});
  }
  /*
  why we return the function ?
    The function we return from catchAsyncErrors is going to be called by Express with the  req, res, and next arguments. 
    In the example above, there is no return value so it returns undefined by default. 
    Express will then try to invoke undefined as a function which will lead to an error.
    If we return a function, then Express will call that function with req, res and next. We in turn can pass those variables to fn(req, res, next).
  */
};


exports.topTours = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingAverage,duration,difficulty,summary";

  next();
};


exports.getAllTours = factory.getAll(Tour);

/*
        !!! NO NEED FOR THIS !!!
exports.getAllTours = async (request, response) => {
  try {

    console.log("INSIDE GETALLTOURS");
    


        // 1) filttering data using request.query :
        // link?key=value&key=value
        const queryObj = {...request.query};
        const excludedParams = ["page", "sort", "limit", "fields"];
        excludedParams.forEach(element => delete queryObj[element]);



    const query = APIFeature(request,response,Tour);
    // const tours = await query.populate({path: "guides", select: "-__v -changedPasswordAt"});
    const tours = await query;
    response.status(200).json({
      status: "success", // or fail (when somtheing happens at the client side) or error (when somtheing happens server side).
      result: tours.length,
      data: {
        // the actual data we wanna send to the client .
        tours, // no need to write the key if it has the same name as variable.
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      messaga: error.message,
      
    });
  }
};
   */

// this get route accepts a variable for getting one specific tour :
// to add an optional paramater write /:y?
exports.getTour = factory.getOne(Tour, {path: "reviews"});
 /*
exports.getTour = catchAsync (async (request, response, next) => {
  
 
    !!! NO NEED FOR THIS !!!

    console.log(request.params); // it returns an obj.
    const id = +request.params.id;
    // if(id > tours.length) {
    //     return response.status(404).json({
    //         statur: "fail",
    //         message: "invalid id"
    //     });
    // }

    const selectedTour = tours.find(element => element.id === id);
    response.status(200).json({
        status: "success",
        data: {
            selectedTour
        }
    });
    
});
*/

exports.createTour = factory.createOne(Tour);

 /*
exports.createTour = catchAsync (async (request, response, next) => {
  //try {
    // create() returs a promise
    const newTour = await Tour.create(request.body);
    response.status(201).json({
      // 201 stands for created a new resource at the server .
      status: "success",
      data: {
        tour: newTour,
      },
    });
  // } catch (error) {
  //   response.status(400).json({
  //     status: "fail",
  //     message: error.message,
  //   });
  // }

 
    !!! NO NEED FOR THIS !!!

    // console.log(request.body);

    //1) getting the id of last obj to add the new one:
    const newId = tours[tours.length -1 ].id + 1;
    console.log(newId);
    // console.log(typeof(newId));
    // console.log(typeof(request.body));
    
    //2) merding the source obj to the target obj using object.assign
    // which is used to copy the values and properties from one or more source objects to a target object (target, source):
    const newTour = Object.assign({id: newId}, request.body);

    //3) pushing the new tour into the tours array:
    tours.push(newTour);
    // the tours is now just an JS pbj so we must convert it to be a JSON obj.
    fs.writeFile("./dev-data/data/tours-simple.json", JSON.stringify(tours),
     error => {
        response.status(201).json({ // 201 stands for created a new resource at the server .
            status: "success",
            data: {
                tour:newTour
            }
        });
     });
     
});*/


// multer is a md for handlig multi-part form data,
// which they're a form encoding that used to upload files from a form .
// 1) Creating a multer storage :

const multerStorage = multer.memoryStorage();


// 2) Creatin a multer filter (to test if the uploaded file is really an image):
const multerFilter = (request, file, cb) => {
  if (file.mimetype.startsWith("image")) return cb(null, true);
  return cb(new AppError(400, `The only accepted files are images, please select an image`), false);

};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
                        // wa want to upload more than 1 image so
                        // we're going to use fileds which takes an array of obj.
exports.uploadTourImages = upload.fields([
  {name: "imageCover", maxCount: 1},
  {name: "images", maxCount: 3}
]);

/*
    upload.array("images", 3);
    Another way fo uploading multiple files BUT FOR ONE FIELD .
*/

exports.resizeTourImages = catchAsync (async (request, response, next) => {
  // console.log("resizeTourImages INSIDER 1 ",request.files);
  if(request.files.imageCover) {
    // console.log("resizeTourImages if() INSIDER");
    
  // const imageCoverFilename = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;
  request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;  
  await sharp(request.files.imageCover[0].buffer)
    .resize(2000, 1333, { fit: sharp.fit.inside, withoutEnlargement: true })
    .toFormat("jpeg")
    .jpeg({ quality: 100 })
    // .toFile(`public/img/tours/${imageCoverFilename}`);
    .toFile(`public/img/tours/${request.body.imageCover}`);
  // make upateTour md takes this and update current tour's doc ok.. how?
  // factory.updateOne(Tour) is going to update the whole body
  // so, we will put imageCoverFilename on request.body
  // request.body.imageCover = imageCoverFilename;

  }

  if(request.files.images){

    // 2) Looping over the array of images :
    request.body.images = [];
    await Promise.all(request.files.images.map(async(file, index) => {
      // console.log("PROMIS.ALL INSIDER", file, index);
      
      const filename = `tour-${request.params.id}-${Date.now()}-${index+1}.jpeg`;
      await sharp(file.buffer)
      .resize(2000, 1333, { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`public/img/tours/${filename}`);
  
      request.body.images.push(filename);
    }));
  
    // console.log("resizeTourImages INSIDER 2 ", request.body);
    
  
    /*
  
      هنا تواجهنا مشكلة إن السينك أوايت ما أَستخدمت بالشكل الصحيح لها
      هنا استخدمناها بداخل الفور ايتش لوب بالتالي تنفيذ الكود ما راح ينتظر اللوب و بيروح على نيكست
      لحل هذي المشكلة راح نبدل الفور ايتش بِ ماب و بما إنها ألريدي آسينك
      ف يعني راح ترجع لنا بروميس و بفضل إننا خليناها ماب راح ينحفظ البروميس في الأراي
      بعد كذا الي باقي لنا إننا نستخدم بروميس.آل عشان نسوي آوايت لهم كلهم
  
    */
  }
  deleteOldImages(request.body, request.params.id);

  
  next();
  
});
exports.updateTour = factory.updateOne(Tour);

/*

**** THIS CONTROLLER HAD BEEN REFACTORED ****

exports.deleteTour = catchAsync (async (request, response, next) => {

    const deletedTour = await Tour.findByIdAndDelete(request.params.id);
    if(!deletedTour) {
      next(new appError(404,"no Tour was found with the specifed ID :(" ));
      return;
    }
    response.status(204).json({
      // 204 means no contents ans that's why we don't send any data
      status: "success",
      data: null,
    });
});

*/

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync (async (request, response)=> {

        // passing an array called STAGES -each stage is an obj- which defines the steps of aggr.
        const stats = await Tour.aggregate([
            {$match: {duration: {$gte: 1} }},
            {$group: {_id:{$toUpper: "$difficulty"}, numTours: {$sum: 1}, totalDays: {$sum: "$duration"}}},
        ]);
        response.status(200).json({
            status: "success",
            data: {
              stats,
            },
          });
});

exports.getMonthlyPlan = (async (request, response)=> {

    const year = +request.params.year
    
    // each tour has 3 starting dates, to make the proccess easier
    // we will create one tour for each date (unwinding) .
    const plan = await Tour.aggregate([
      {$unwind: "$startDates"},
      {$match: {startDates: {$gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)}}}, // push: name is to create an array of all the tours that are starting in the same month.
      {$group:{ _id:{$month: "$startDates"}, numTours: {$sum: 1}, tourName: {$push: "$name"}}},
      {$addFields: {month: "$_id"}},
      {$project: {_id: 0}}, // project is used to remove a field buy specifying a 0 to it.
      //{$sort: {totalTours: -1}}, this wont work because I've named it a different name from the one in $group stage.
      {$sort: {numTours: -1}}, 
      {$limit: 15},
    ]);
    response.status(200).json({
      status: "success",
      data: {
        plan
      },
    });
});

exports.getTourWithin = catchAsync( async(request, response, next) => {
  const { distance, latlng, unit } = request.params;
  const [ lat, lng ] = latlng.split(","); // split() because it is a string then it will become an araay of 2 .
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng) return next(new AppError(400, "Please provide your current location"));

  const nearTours = await Tour.find({ startLocation: { $geoWithin: {$centerSphere: [ [lng, lat], radius] } } });

  response.status(200).json({
    status: "success",
    result: nearTours.length,
    nearTours
  });
});

// calculate the distance from a certain point to all the tours .
exports.getAllDistances = catchAsync( async(request, response, next) => {
  const { latlng, unit } = request.params;
  const [ lat, lng ] = latlng.split(","); // split() because it is a string then it will become an araay of 2 .
  const multiplier = unit === "mi" ? 0.000621371 : 0.001; // miles or kilometers
  if(!lat || !lng) return next(new AppError(400, "Please provide your current location"));


  /*
      we passed in an array with all the stages of the aggregation pipeline
      that we want to define.
      Now for geospatial aggregation, there's actually only one single stage,
      and that's called $geoNear{}.
      this is the only geospatial aggregation pipeline stage that actually exists.
      This one always needs to be THE FIRST ONE in the pipeline.
      So keep that in mind.
      Something else that's also very important to note
      about geoNear is that it requires that at least one of our fields
      contains a geospatial index. which is in our case is startLocation already has
      this 2dsphere geospatial index on it. Since we're using this startLocation
      in order to calculate the distances, well, that's then perfect.
      If there's only one field with a geospatial index
      then this $geoNear:{} stage here will automatically use
      that index in order to perform the calculation.
      But if you have multiple fields with geospatial indexes
      then you need to use the keys parameter
      in order to define the field that you want to use for calculations. keep that in mind .
      in this case we only have one field which is startLocation,
      so automatically it is going to be used for doing these calculations.

      Now, what do we need to pass into geoNear?
      first we need to specify the near:{} property,
      which is the point from which to calculate the distances.
      So all the distances will be calculated from this point
      that we define inside near:{} and then all the start locations.
      So this near point here is of course
      the point that we pass into this function
      with this latitude and longitude.

      Now we need to specify this point here as geojson,
      so that's just like we did it before in tourSchema,
      where we need to specify the type as Point,
      and then specify the coordinates property.
      And as always the first coordinate here is the longitude,
      and then the second one, the latitude.
      And let's multiply both of them by one, simply to convert it to numbers.
      So near:{} is the first mandatory field,
      and the second one is the distanceField property.
      So, distanceField, and so this is the name
      of the field that will be created
      and where all the calculated distances will be stored.
      So let's simply call this one "distance".
      Actually, that's it. That's all the fields that are mandatory
      in this geoNear stage. And of course, we can add other stages here.
  */
  const toursDistances = await Tour.aggregate([
    {$geoNear: {near: {type: "Point", coordinates: [lng * 1 , lat * 1]}, distanceField: "distance", distanceMultiplier: multiplier}},
    {$project: {distance: 1, name: 1}}
  ]);

  response.status(200).json({
    status: "success",
    result: toursDistances.length,
    toursDistances
  });
});