let passwordField = document.getElementById('newPassword');
let confirmPassword = document.getElementById('confirmPassword');
//pointers to all the other input needs 
let upperCase = document.getElementById('uppercase');
let lowerCase= document.getElementById("lowercase");
let number = document.getElementById('number');
let specialChar = document.getElementById('specialChar');
let length = document.getElementById("length");
let matching = document.getElementById("matching");

let submit = document.getElementById('submit');

//in case they have previous passowrd autofill
updateValidation();
//add and remove the validation box
// passwordField.onfocus = () =>{
//     document.getElementById("passwordValidationForm").style.display = "block";
// }

// passwordField.onblur = () =>{
//     document.getElementById("passwordValidationForm").style.display = "none";
// }
// confirmPassword.onfocus = () =>{
//     document.getElementById("passwordValidationForm").style.display = "block";
// }

// confirmPassword.onblur = () =>{
//     document.getElementById("passwordValidationForm").style.display = "none";
// }

//live validations
function updateValidation() {
  // Validate lowercase letters
  let lowerCaseLetters = /[a-z]/g
  if(passwordField.value.match(lowerCaseLetters)) {
    lowerCase.classList.remove("invalid");
    lowerCase.classList.add("valid");
  } else {
    lowerCase.classList.remove("valid");
    lowerCase.classList.add("invalid");
}

  // Validate capital letters
  let upperCaseLetters = /[A-Z]/g;
  if(passwordField.value.match(upperCaseLetters)) {
    upperCase.classList.remove("invalid");
    upperCase.classList.add("valid");
  } else {
    upperCase.classList.remove("valid");
    upperCase.classList.add("invalid");
  }

  // Validate numbers
  let numbers = /[0-9]/g;
  if(passwordField.value.match(numbers)) {
    number.classList.remove("invalid");
    number.classList.add("valid");
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

  // Validate length
  if(passwordField.value.length >= 7) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }
    // Validate special characters
  let special = /[!@#$%^&*(),.?":{}|<>]/g;
  if(passwordField.value.match(special)) {
    specialChar.classList.remove("invalid");
    specialChar.classList.add("valid");
  } else {
    specialChar.classList.remove("valid");
    specialChar.classList.add("invalid");
  }
  if(passwordField.value.length > 0 && passwordField.value == confirmPassword.value){
    matching.classList.remove("invalid");
    matching.classList.add("valid");
  } else {
    matching.classList.remove("valid");
    matching.classList.add("invalid");
  }
}



passwordField.onkeyup = () => {updateValidation();}
confirmPassword.onkeyup = () => {updateValidation();}
//check if the current password setup is valid
//this  ensures that no invalid passwords are sent back to the
function checkPassword() {
    let numbers = /[0-9]/g;
    let lowerCaseLetters = /[a-z]/g
    let upperCaseLetters = /[A-Z]/g;
    let special = /[!@#$%^&*(),.?":{}|<>]/g;
    let minLen = 7;

    return (passwordField.value.match(numbers) && 
        passwordField.value.match(lowerCaseLetters) && 
        passwordField.value.match(upperCaseLetters) && 
        passwordField.value.match(special) && 
        passwordField.value.length >= minLen &&
        passwordField.value == confirmPassword.value)
}

submit.addEventListener("click", function(e){
    e.preventDefault();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const data = {"newPassword": passwordField.value};
    console.log(params);
    if(checkPassword()){
      const url = `http://localhost:5000/api/passwordreset/reset/${params.id}`;
        console.log("Valid password!");
        //send request to the back end now finally
       fetch(url, {
         method: "POST",
         headers: {
          'Content-Type': 'application/json'

        },
         body: JSON.stringify(data)
       }).then(response =>{
         if(response.status == 200){
           //TODO: Change this to a success re
          //  window.location.replace("https://www.youtube.com/watch?vi=xvFZjo5PgG0");
          alert("Password Reset!");
         }
       }).catch(error =>{
         console.log(error);
       })
    }
})