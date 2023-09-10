import { showAlerts } from "./alerts.cjs";
import { useFetch } from "./fetchData";

export const login = async (email, password) => {
  // console.log(email, password);
  
  try {
    const result = await useFetch("/api/v1/users/login", "POST", {email, password});

    if (result.status === "success") setTimeout(() => window.location.replace("/"), 200);
    // setTimeout(() => window.location.assign("/"), 1000); // another way or redirecting the user to the overview page

    if (result.status !== "success") return;
  } catch (error) {    
    showAlerts("error", error.message);
  }
};

export const logout = async () => {
  try {

    const result = await useFetch("/api/v1/users/logout", "GET");

    /*
       just use location.replace instead of assign inorder to discard current page from the history 
       and then load new document
    */
    if (result.status === "success") {
      /*
      I changed this because when the user logged out while still inside one of the protected routes (myBookings, myProfile), 
      the same protected page was going to reload with an unloged-in user so an error message was going to appear . 
      and the correct behaviour in this case is to redirect the user to the home page
      location.reload(true); // true for forcing the reload from the server and not from the browser cache .
    */
      setTimeout(() => window.location.assign("/"), 1000);
    }
  
  } catch (error) {
    showAlerts("error", "Error has occurred while logging out, try again")
  }
}

/*
        useFetch is a helper function that can be used with both POST & GET requests (depending if you provide the 2nd argument or not).
        timeout is another helper that will reject the promise and throw an error after the specified amount of time (for request to time out)
        You can move these 2 functions to a separate module if you are using a bundler or ES6 modules (so you can reuse' em anywhere you want)
*/
