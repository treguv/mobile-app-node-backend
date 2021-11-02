let passwordField = document.getElementById('newPassword');
let confirmPassword = document.getElementById('confirmPassword');
//pointers to all the other input needs 
let upperCase = document.getElementById('uppercase');
let lowerCase= document.getElementById("lowercase");
let number = document.getElementById('number');
let specialChar = document.getElementById('specialChar');
let length = document.getElementById("length");
let matching = document.getElementById("matching");

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
passwordField.onkeyup = function() {
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
  if(passwordField.value == confirmPassword.value){
    matching.classList.remove("invalid");
    matching.classList.add("valid");
  } else {
    matching.classList.remove("valid");
    matching.classList.add("invalid");
  }
}