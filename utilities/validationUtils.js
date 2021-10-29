/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
let isStringProvided = (param) => 
    param !== undefined && param.length > 0


// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any 

// TODO: Fix documentation, remove Lab 4 references
// Only allows capital letters, lowercase letters, and hyphens in first or last names
let isValidName = (name) => {
    let isValid = false;
    let charRestriction = /^[A-Za-z-]+$/;
    if(isStringProvided(name) && name.match(charRestriction)) {
        isValid = true;
    }
    return isValid
}
  
module.exports = { 
  isStringProvided,
  isValidName
}