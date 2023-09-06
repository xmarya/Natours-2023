const mongoose = require("mongoose");
const dotenv = require('dotenv');
const fs = require("fs");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");



dotenv.config().parsed;
const db = process.env.DATABASE_LOCAL;
// console.log(db);


// this connect method is returing a promise so we have to handle it using then.
mongoose.connect(db, {}).then(() => console.log("can be written ?"));

  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
  const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
  const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

  const importData = async() => {
   // node dev-data/data/import-dbdata.js --import
    try {
        await Tour.create(tours); // create() can accept an array and will create a doc for each element.
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log("does it succeed?");
        
    } catch (error) {
      console.log(error.stack);
        console.log("something's happend...");  
    }
  }

  // delete the old testing data :
  const deleteData = async ()=> {
    //node dev-data/data/import-dbdata.js --delete
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
    } catch (error) {
        console.log(error);
        
    }
  }

  if (process.argv[2] === "--import") {
    importData();
  }
  else if (process.argv[2] === "--delete") {
    deleteData();
  }
  