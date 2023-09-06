import axios from "axios";
import { showAlerts } from "./alerts.cjs";

export const bookTour = async (tourId) => {
  try {
    // 1) Getting the session of the server by using
    //  the route of /cheaout-session endpoint:
    const session = await axios(`http://127.0.0.1:8080/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Using TAP to automatichally create the checkout form
    //  and Charging the credit card :
    /*
    await strip.redirectTocheckout({
        sessionId: session.data.session.id // this comes from axios .
    });
    */
  } catch (error) {
    showAlerts("error", "Sorry, something went worng, Try againg");
    console.log(error);
    
  }
};
