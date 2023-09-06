const mongoose = require("mongoose");
const validator = require("validator");
const Tour = require("./tourModel");
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please write a title"],
      trim: true,
    },

    text: {
      type: String,
      required: [ true, "You can't post a review without writing a word, right?" ],
      trim: true,
      maxLenght: [
        300,
        "You've exceeded the maximum lenght of charechters, Please shorten your review ♥",
      ],
      minLenght: [
        6,
        "You must have more to say than writing just 6 letters ! write your honset opinion Please ♥",
      ],
      // validate: [
      //   validator.isAlphanumeric,
      //   "Please write a proper review to help other users"
      // ],
    },

    rating: {
      type: Number,
      min: [1, "rating must be 1 to 5"],
      max: [5, "rating must be 1 to 5"],
    },

    createdAt: {
      type: Date,
      defualt: Date.now(),
      //   default: new Date().toLocaleString(),
    },

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  // ^^ SCHEMA DEFENITION ^^

  { timestamps: true, strictQuery: true }, // these two are NECESSARY for Excluding fields in query inside toursController.js, this line MUST BE THE after schema defenition and before schema options..

  // vv SCHEMA OPTIONS vv
  {
    toJSON: { virtuals: true }, // means I need the virual to be part of the output .
    toObject: { virtuals: true }, // mean I want it to be outputed as an obj .
  }
);

// using compound index to prevent more than one review from tha same user :
// true means the compination of tour and writer must be uniqu .
reviewSchema.index({ tour:1, writer: 1 }, {unique: true});

reviewSchema.pre(/^find/, function (next) {
  // this.populate({path: "writer", select: "name photo"});
  this.populate({
    path: 'writer',
    options: { select: 'name photo' } // <-- and here
});
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {

  // console.log("calcAverageRatings INSIDER :");
  
  // here, in this line, this is pointing to the model .
  const stats = await this.aggregate([ // the stats will become an array because of aggregate .
    {
      // 1) Selecting all the reviws of the passed tour:
      $match: {tour: tourId}
    },
    {
      // 2) Grouping and calculating the sum of rating and it's average:
      $group: {_id: "$tour", nRatings: {$sum: 1}, avgRatings: {$avg: "$rating"}}
    }
  ]); 
  // console.log(stats);
  // console.log(stats.lenght);
  

  // 3) Presisting the number of ratings and ratings average
  // in the tour doc:
  if(stats.lenght > 0) {
    // console.log("if stats.lenght");
    
    await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRatings
  });
}
  else {
    // console.log("else stats.lenght");
    
    await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: 0,
     ratingsAverage: 0
    });
  }

  // console.log(stats);
}

/*
  we shouldn't use pre,
  but instead we should use the post save middleware, okay.
  And that's because at pre(save) the current review is not really
  in the collection just yet.
  So therefore, when we then do this $match here
  it shouldn't be able to then appear in the output here,
  because again at this point in time
  it's not really saved into the collection just yet, okay.
  So it's best to use post() here,
  because at that time, of course,
  all the documents are already saved in the database
  and so that's then a great time
  to actually do this calculation with all the reviews already
  and then store the result on the tour.
*/
reviewSchema.post("save", function() { //post() has no access to next() md .
  // console.log(this.construtor.calcAverageRatings);
  // console.log(this.construtor.calcAverageRatings(this.tour));
  // console.log("reviewSchema.post() INSIDER:");
  
  
  /*
    لأن ميثود ستاتيكس ال فوق ما تجي إلا مع المودل نفسه
    و المودل لسى ما أنشأناه في هذي اللحظة راح نستخدم الكونستركتور
    لأنه ببساطة ذيس تشير للدوكيومنت الحالية و مع الكونستركتر هو المودل الي سوينا منه هذي الدوكيومنت
  */
  this.construtor.calcAverageRatings(this.tour);
});

/*
  For findByIdAndUpdate() & findByIdAndDelete()
  we don't have document md, just have query md and in it we don't have
  direct access to the doc in order to do 
  somthing simillar to this.construtor.calcAverageRatings(this.tour);
  قدرنا ننفذ اللاين الي فوق لأن عندنا وصول للريفيو الحالي و استخرجنا منه آيدي التور
  We're going to use findOneAnd..() because, remember that behind the scenes,
  findByIdAndUpdate() is only just a shorthand
  for findOneAndUpdate with the current ID, right.
  So here, we actually need to use the findOneAndDelete
  and findOneAndUpdate middleware hooks
*/
reviewSchema.pre(/^findOneAnd/, async function(next) {
  /*
    ذيس كيوورد هنا تُشير إلى الكويري لأننا محددين نوع من أنواع الكويري بداخل بري ميثود
    عشان نحل مشكلة عدم وصولنا للدوكيومنت حقت الريفيو الحالية راح ننفذ الكويري و بعدها
    هو راح يرجع لنا الدوكيومنت التي تمت عليها العملية كاملة
  */
 this.currentReview = await this.findOne();
  /*
    let's actually update the rating from 5 to 4,
    Now of course, the rating is still set to 5
    at this point, because this findOne() gets the document from the database,
    and so at this point of time, in pre() doesn't persist any changes to the database,
    and so it was 5 before and it's still gonna be 5.
    But that doesn't really matter here
    because all we are interested in is this ID
    in order to calculate the average ratings.
    Okay, now, let's think about this
    because if we were to use this calcAverageRatings function
    at this point in time, then we would calculate the statistics
    using the non-updated data.
    And so that's the exact same reason why up here, this.construtor.calcAverageRatings(this.tour);
    we also needed to use post() and not pre(),
    okay, because only after the document is already saved
    to the database it makes sense to then calculate the ratings.
    And so here, it's the exact same thing,
    with the big difference that we cannot simply change
    this md from pre() to post().
    So we cannot do that because at this point in time
    we no longer have access to the query
    because the query has already executed, right,
    and so without the query,
    we cannot save the review document,
    and we can then not run calcAverageRatings() function.

    SOLUTION:
    So, the solution for this is to now use post().
    the query has finished, the review has been updated -not saved at the db-
    so the perfect point in time when we can call calcAverageRatings()
    BUT STILL... from where do we now get the tourId from?
    SIMPLE! we'll pass the data from pre() md by 
    converting const currentReview to this.currentReview
    in this way we can have access to this variable.
  */
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.cuurentRevies is equevelent to this that we used in this.construtor.calcAverageRatings .
  await this.currentReview.construtor.calcAverageRatings(this.currentReview.tour);
})

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
