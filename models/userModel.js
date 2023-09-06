const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // built-in node module, no need to install it
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "name must be inserted field ..."],
      minlenght: 10,
      maxlenght: 25,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // not a validator, just a converter .
      validate: [validator.isEmail, "please write a valid email address"],
    },

    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, "password must be at least 8 charecters"],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(element) { // validator func just returns true or false AND JUST WORKS ON SAVE(). so, when we updating a user we must use save() in order to trigger this validator .
          return element === this.password;
        },
        message: "make sure the entered passwords are matching"
      }
    },
    photo: {
      type: String,
      default: "default.jpg"  
    },
    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user"
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
  },


  { timestamps: true, strictQuery: true }, // these two are NECESSARY for Excluding fields in query inside toursController.js, this line MUST BE THE after schema defenition and before schema options..

  {
    toJSON: { virtuals: true }, // means I need the virual to be part of the output .
    toObject: { virtuals: true }, // mean I want it to be outputed as an obj .
  }
);

userSchema.pre("save", async function(next) {
  /*
  Okay, now we actually only want to encrypt the password
  if the password field has actually been updated, okay?
  So basically only when really the password is changed
  or also when it's created new, all right?
  Because imagine the user is only updating the email.
  Then in that case, of course,
  we do not want to encrypt the password again.
  */
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 13);
  this.passwordConfirm = undefined; 
  // delete the filed so it won't be presist to the db after making sure that 
  // the pw and pwc are okay. also the require:true that is defined in the schema just means 
  // it's required input and dosn't mean it's a required field to be stored.
  next();
});

userSchema.pre("save", function(next){
      // !flase => true || new document => true , these two conditions must be tested before setting passwordChangedAt property on each pre("save"); 
  if(!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

/*
  instance method. So an instance method is basically a method
  that is gonna be available on all documents of a certain collection.
*/
userSchema.methods.comparePassword = async function(comingPassword, currentPassword) {
  /* 
    Now inside of these instanced methods, since they are available on the document, 
    the this keyword actually points to the current document.
    But in this case, since we have the password
    set to select false, so this here, remember? Okay, and because of that,
    this.password will not be available. So we will pass them:
  */

 return await bcrypt.compare(comingPassword ,currentPassword);

}

userSchema.methods.changedPasswordAfter = function(jwtTimeStamp) {
  
  if(this.passwordChangedAt) {
    const changedtTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(jwtTimeStamp , this.passwordChangedAt, changedtTimeStamp);
    return jwtTimeStamp < changedtTimeStamp; // means that no changes hav happedn on password.
    // lets say that the token was generated at time 100 and then it was changed at time 200
    // so when 100 < 200 that means true, the password has been changed after issuing the token .
    // in case the password was changed at 200 then the token generated at 300,
    // here that means the password hasn't been changed because the token was issued later .
    // so, the whole comparesion is to see was the token released before or after the time which a password has been changed at .
  }
  
  return false; // the defualt returned value of the instanse method which means the user hasn't changed his password .

}

userSchema.methods.randomToken = function() {
  const randomToken = crypto.randomBytes(32).toString("hex");
  /*
    this token is what we're gonna send to the user and so it's like a reset password really that the user 
    can then use to create a new real password.
    And of course, only the user will have access to this token.
    And so in fact, it really behaves kind of like a password.
    Since essentially it is just a password,
    it means that if a hacker can get access to our database,
    well then that's gonna allow the hacker to gain access
    to the account by setting a new password.
    If we would just simply store this reset token
    in our database now, then if some attacker gains access
    to the database, they could then use
    that token and create a new password using that token
    instead of you doing it.
    They would then effectively control your account
    instead of you doing it.
    Just like a password, we should never store
  */
  this.passwordResetToken = crypto.createHash("sha256").update(randomToken).digest("hex");
  this.passwordResetExpires = Date.now() + 90 * 60 * 1000; // I want the token to last for 1m and half (90s) .

  console.log({randomToken}, this.passwordResetToken);
  

  return randomToken;

  /*
    We need to send via email
    the unencrypted reset token because otherwise
    it wouldn't make much sense to encrypt it at all.
    If the token that was in the database
    was the exact same that we could use
    to actually change the password,
    well then that wouldn't be any encryption at all.
    We sent one token via email
    and then we have the encrypted version in our database.
    And that encrypted one is then basically useless
    to change the password.
    It's just like when we're saving only the
    encrypted password itself to the database,
  */
}

const User = mongoose.model("User", userSchema);
module.exports = User;
