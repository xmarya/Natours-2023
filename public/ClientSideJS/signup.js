import { useFetch } from "./fetchData";
import { showAlerts } from "./alerts.cjs";

export const signup = async(data) => {
    console.log("signup INSIDER");
    console.log(data);
    
    try {
        const result = await useFetch("/api/v1/users/signup", "POST", data);
        
        if(result.status === "success") {
            showAlerts("success", "Your ccount on Natours is ready ! login and Start the Adventure");
            setTimeout( () => location.assign("/"), 1.5* 1000);
        }
        if (result.status !== "success") return;
    } catch (error) {
        showAlerts("error", error.message);
        // setTimeout( () => location.reload(), 1.5* 1000);
    }
    

}