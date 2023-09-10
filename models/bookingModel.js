const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Booking must be belong to a Tour ."],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Any booking has someone who booked it ."],
    },

    price: {
        type: Number,
    },

    purchasedAt: {
      type: Date,
      default: Date.now(),
    },

    paid: {
        type: Boolean,
        default: true
    }
  },
  // ^^ SCHEMA DEFENITION ^^

  { timestamps: true, strictQuery: true }, // these two are NECESSARY for Excluding fields in query inside toursController.js, this line MUST BE THE after schema defenition and before schema options..

  // vv SCHEMA OPTIONS vv
  {
    toJSON: { virtuals: true }, // means I need the virual to be part of the output .
    toObject: { virtuals: true }, // mean I want it to be outputed as an obj .
  }
);

// bookingSchema.index({tour: 1 , user: 1}, {unique: true});

bookingSchema.pre(/^find/, function(next) {
    this.populate("user").populate({path: "tour", select: "name"});
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
