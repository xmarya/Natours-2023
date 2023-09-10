import { showAlerts } from "./alerts.cjs";
import { useFetch } from "./fetchData";

// const User = require("../../models/userModel");
/*
    This md is a more traditional normal way.
    in which we specify the POST method right on the form,
    along with the URL where the POST request should be sent to.
    By using this method, we don't need JavaScript
    for doing the request, it automatically happens
    with the HTML form which will then post the data
    to the URL endpoint in our backend that we specified.
    exports.noJSUpdateProfile = catchAsync( async(request, response, next) => {
      // console.log(request.body); this won't work and it's going to be embty object, we need a md to parse the data coming from the form .
      // I could add the md in the app.js but I oo lazy to fo that
      // so if yout wanted to implement this way in the future
      // review the lec please .
      const updatedUser = await User.findByIdAndUpdate(request.user.id, {
        name: request.body.name,
        email: request.body.email
        // tne names in request.body.() they must be the same as what we gived o the form in the html -whivh I've not done-
      },
      {
        new: true,
        runValidators: true
      });
      
      response.status(200).render("profile",{
        title: "My profile",
        user: updatedUser
      });
    });
  */

// Updating using our API and JS:

export const updateTheProfile = async (data, type) => {
// console.log("updateTheProfile INSIDER "+type);

  try {
    const url = type === "password" ? "updateMyPassword" : "updateMyData";
    const result = await useFetch(`/api/v1/users/${url}`,"PATCH", data, type);
    // console.log(result.status);

    if (result.status === "success") showAlerts("success", `Your ${type}'s been updated successfully !♥`);
    
  } catch (error) {
    showAlerts("error", error.message);
  }
};
