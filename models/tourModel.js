const mongoose = require("mongoose");
const slugify = require("slugify");


// schema and modeling (models is a blue print to create collections, it's like Classes), and schema is essential to create models :
// 1) SCHEMA:
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Any tour must have a name !"], // validator
    unique: true,
    trim: true, // to get rid of any white space at the beggining and the end
    maxlength: [40, "too long. name must be <= 40 letters"], // just for strings
    minlength: [10, "too short. name must be >= 10 letters"], // just for strings
  },
  duration: {
    type: Number,
    required: [true, "Any tour must have duration"],
  },
  maxGroupSize: {
    type: Number,
    reqired: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: { // only for strings .
    values: ["easy", "medium", "difficult"],
    message: "acceptable values are: [easy, medium, difficult]"
    },
  },
  price: {
    type: Number,
    required: [true, "Any tour must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: { // this validator won't run on update doc .
      validator: function(value) {
        return this.priceDiscount < this.price;
      },
      message: "discount ({VALUE}) must be below reqular price"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 0.0,
    min: [1, "rating must be 1 to 5"], // works with dates too .
    max: [5, "rating must be 1 to 5"], // works with dates too .
    set: value => Math.round(value * 10) / 10 // 4.66666 * 10 => 46.6666 => round => 47 / 10 => 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0.0,
  },
  summary: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String, // to read the name of it rather than storing it in db, the thing that will be store in db is the refernce of the image.
    required: true,
  },
  images: [String], // an array of strings
  creadtedAt: {
    type: Date,
    // default: Date.now(),
    default: Date.now(),
    select: false, // excluding
  },
  startDates: [Date],
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
  },
    /*
    we also could make the thing more simpler by writing:
    secretTour: {
      type: Boolean,
      default: false,
      select: false
    }
    so then we won't use the quey md .
  */

  /*
     this object that we specified here
      is actually, this time, not for the schema type options
      as we have it until this point.
      So this object here for example (secretTour) is for the schema type options.
      Remember that?
      But now, this object here (startLocation) is actually really
      an embedded object.
      And so inside this object,
      we can specify a couple of properties (type and coors).
      All right, and in order for this object to be recognized
      as geospatial JSON, we need the type
      and the coordinates properties, all right.
      And so now, each of these fields (type and coors) here,
      so basically, each of these sub-fields is then gonna get
      its own schema type options.
      so here, it's a bit nested,
      so we have one level deeper.
      Okay, so we have the type schema type options
      and then we also need schema type options for coordinates.
      The same thing applies to location obj.
  */
  startLocation: {
    // mongodb uses a special data format called: GeoJson in order to specifiy geo data .
    type: {
      type: String,
      default: "Point", // one of the multiple Geometries thet mongodb has, point is kinda the default one.
      enum: ["Point"] // for statLocation we REALLY just want the value of Geometries to be "Point" so we defined enum to make "Point" the only possible option .
    },
    coordinates: [Number], //[lng, lat]
    address: String,
    description: String,
  },

  /*
      Note about locations[] :
      Whenever you define an object in an array, Mongoose creates a schema for it behind the scene,
      so it treats it as a subdocument. A consequence of this is that Mongoose will add an _id field to each object.
  */
  locations: [
    {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number], //[lng, lat]
      address: String,
      description: String,
      day: Number
    }
  ],

  // Refrencing format :
  guides: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

},
// ^^ SCHEMA DEFENITION ^^
{ timestamps: true, strictQuery: true},// these two are NECESSARY for Excluding fields in query inside toursController.js, this line MUST BE THE after schema defenition and before schema options..

// vv SCHEMA OPTIONS vv
{
  toJSON: {virtuals: true}, // means I need the virual to be part of the output .
  toObject: {virtuals: true}, // mean I want it to be outputed as an obj .
}


);

// virtual properties :
// this virtual property will be created each time a data is recieved from db.
tourSchema.virtual("durationWeeks").get(function() { // don't use an arrow func in this cb here! ok why? that's because an arrow func doesn't have a this. keyword which we need to define the vp.
  return this.duration / 7;
  // this. here is pointing to the current doc .
}); 

// Virtual Populate :
tourSchema.virtual("reviews", {
  ref:"Review",
  // specifing the names of the fields (the foreign field and local field) in order to cennect the data sets :
  localField: "_id", // the field where we store the data of foreign key we have gotten .
  foreignField: "tour", // the field where the tour's id is being stored .
  count: true
});

/*
  There are 4 different types of md in mongoose
    1- Document => acts on currently processed doc . and this. kw inside it refers to the current doc .
    2- Querie => runs before or after a certain query is excuted . and this. kw inside it refers to the current query .
    3- aggregate => you can guess what it does.
    4- model md => Jonas's said it's not really important .
*/
          // pre runs BEFORE two specific events .
          // which they're .save and .create .
tourSchema.pre("save", function(next) {
  // create a -damn- slug:
  this.slug = slugify(this.name, {lower: true})
  next();
});
          // post md has an access to the doc that was just saved to the db .
          // and it runs AFTER ALL the pre mds have completed,
          // so in post we don't have this. kw but instead we have the finished doc .
// tourSchema.post("save", function(doc, next) {
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.find({secretTour: {$ne: true}});
  next();
});


const GEOSPATIAL_OPERATOR_TEST = /^[$]geo[a-zA-Z]*/;
 
tourSchema.pre('aggregate', function(next) {
  /* 
  Below is a way to pretty print nested objects in terminal irrespective of the level of the nesting
  in the object to be printed. 
  Here 2 sets indentation to value 2.
  console.log(JSON.stringify(yourObj, null, 2));
  */


  const geoAggregate = this.pipeline().filter(
    // finding if the pipeline stage name has any geo operator using the regex. 'search' method on a string returns -1 if the match is not found else non zero value
    stage => Object.keys(stage)[0].search(GEOSPATIAL_OPERATOR_TEST) !== -1
  );
 
  if (geoAggregate.length === 0) {
  this.pipeline().unshift({$match: {secretTour: {$ne: true}}}); // adding the new $match at the first index of the array . and shift() does the oppesite thing .
  }
  next();
});

// tourSchema.pre("aggregate", function(next) {
//   // console.log(this.pipeline());
//   this.pipeline().unshift({$match: {secretTour: {$ne: true}}}); // adding the new $match at the first index of the array . and shift() does the oppesite thing .
//   next();
// });


tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });
  next();
});

// Price's INDEX: (single field index):
//tourSchema.index({price: 1}); // there are many type of the value we can use here .
// Compouned INDEX:
tourSchema.index({price: 1, ratingsAverage: -1});

tourSchema.index({slug: 1});

tourSchema.index({startLocation: "2dsphere" });
// 2) MODEL:
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
