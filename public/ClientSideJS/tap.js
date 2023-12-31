import { useFetch } from "./fetchData";
import { showAlerts } from "./alerts.cjs";

export const bookTour = (async (tourId) => {
  
  try {
    const result = await useFetch(`/api/v1/bookings/checkout/${tourId}`, "POST", {tourId});  
    
    if (result.status === "success")  {            
      showAlerts("success","Your've booked one tour successfully");
      setTimeout(() => location.assign("/myBookings"), 1.5 * 1000);
    }
    
  } catch (error) {
    showAlerts("error", error.message);
    // setTimeout(() => location.assign("/myBookings"), 1.5 * 1000);
  }
})


/*

import axios from "axios";
import { showAlerts } from "./alerts.cjs";

export const payTour = async (tourId) => {
  try {
    // 1) Getting the session of the server by using
    //  the route of /cheaout-session endpoint:
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Using TAP to automatichally create the checkout form
    //  and Charging the credit card :
    
    await strip.redirectTocheckout({
        sessionId: session.data.session.id // this comes from axios .
    });
    
  } catch (error) {
    showAlerts("error", "Sorry, something went worng, Try againg");
    // console.log(error);
    
  }
};

*/