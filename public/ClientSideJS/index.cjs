import { signup } from "./signup";
import { login, logout } from "./login.cjs";
import { updateTheProfile } from "./updateProfile";
import { bookTour } from "./tap";

// const handleSubmit = (event) => {
//   event.preventDefault();

//   const email = event.target.email?.value;
//   const password = event.target.password?.value;
// // console.log(email, password);
//   login(email, password);

//   formEl.reset();
// };

// All of the IFs here are to prevent CAN'T READ NULL .FROM when we're in pages that doesn't have form element .

const formSignup = document.querySelector(".form--signup");
if(formSignup) formSignup.addEventListener("submit", (event) => {
  console.log("formSignup eventListener INSIDER");
  
  event.preventDefault();
  document.querySelector(".btn--form-signup").textContent = "Processing...";


  const name = event.target.username.value;
  const email = event.target.email.value;
  const password = event.target.password.value;
  const passwordConfirm = event.target.passwordConfirm.value;

  signup({name, email, password, passwordConfirm});
  formSignup.reset();

});

const formEl = document.querySelector(".form--login");
if (formEl) formEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = event.target.email?.value;
  const password = event.target.password?.value;
// console.log(email, password);
  login(email, password);

  formEl.reset();
}); 

const logoutBtn = document.querySelector(".nav__el--logout");
if (logoutBtn) logoutBtn.addEventListener("click", logout);


const profileForm = document.querySelector(".form-user-data");
if (profileForm) {  
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector(".btn--save-settings").textContent = "Updating...";

    /* OLD CODE
    const form = new FormData();
  
    // form.append("name", document.getElementById("name").value);
    // form.append("email", document.getElementById("email").value);
    // form.append("photo", document.getElementById("photo").files[0]); // files here is an array, but it will only contain one element so we're going to specify it directly .

    form.append("name", name);
    form.append("email", email);
    form.append("photo", photo);
    */
    const name = event.target.name?.value;
    // console.log(name);
    
    const email = event.target.email?.value;
    // console.log(email);
    
    const photo = event.target.photo?.files[0];
    // console.log(photo);
    
    // an equvelant way to the two lines fo OLD CODE
    // const name = document.getElementById("name").value;
    // const email = document.getElementById("email").value;
    // updateProfile(name, email);

    updateTheProfile({name, email, photo}, "profile");
    profileForm.reset();
    setTimeout(() => location.reload(), 1 * 1000);
  });
}
const passwordForm = document.querySelector(".form-user-password");
if (passwordForm)
  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    document.querySelector(".btn--save-password").textContent = "Updating...";

    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password-new").value;
    const confirmNewPassword =
      document.getElementById("password-confirm").value;
    await updateTheProfile({ currentPassword, newPassword, confirmNewPassword }, "password");

    passwordForm.reset();
    document.querySelector(".btn--save-password").textContent = "Save Password";
  });

  const bookingBtn = document.getElementById("book-tour");
if(bookingBtn)
    bookingBtn.addEventListener("click", event => {
  
      /*

      inside tour.pug we've defined the dataset varible as tour-id
      which is going to be converted to a Camel case like this tourId because of JavaScript
      therefor no need to write the code like the way below, we can shorten it
      like we actually have been doning using the {}.

      const tourId = event.target.dataset.tourId;

      */
      bookingBtn.textContent = "Processing...";
      const {tourId} = event.target.dataset;      
      bookTour(tourId);
  });
