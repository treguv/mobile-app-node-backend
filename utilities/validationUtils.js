const MAX_INPUT_LENGTH = 255
const MIN_NAME_LENGTH = 2
const MIN_USERNAME_LENGTH = 2
const MAX_USERNAME_LENGTH = 24
const MIN_EMAIL_LENGTH = 3
const MIN_PASSWORD_LENGTH = 7

/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, 
 *  false otherwise
 */
let isStringProvided = (param) => 
    param !== undefined && param.length > 0

/**
 * Checks the parameter to see if it is a valid name.
 * 
 * @param {string} name the name to check
 * @returns true if the name is 2-255 characters long and only contains letters, spaces,
 *  or hyphens. False otherwise.
 */
let isValidName = (name) => {
    let isValid = false;
    let charRestriction = /^[A-Za-z- ]+$/;
    if(isStringProvided(name) 
        && name.match(charRestriction)
        && name.length >= MIN_NAME_LENGTH
        && name.length <= MAX_INPUT_LENGTH) {
        isValid = true;
    }
    return isValid
}

/**
 * Checks the parameter to see if it is a valid username.
 * 
 * @param {string} username the username to check
 * @returns true if the username is 2-24 characters long and only contain letters, 
 * numbers, hyphens, or underscores. False otherwise.
 */
let isValidUsername = (username) => {
    let isValid = false;
    let charRestriction = /^[A-Za-z0-9-_]+$/;
    if(isStringProvided(username) 
            && username.match(charRestriction) 
            && username.length >= MIN_USERNAME_LENGTH 
            && username.length <= MAX_USERNAME_LENGTH) {
        isValid = true;
    }
    return isValid;
}

/**
 * Checks the parameter to see if it is a valid email.
 * 
 * @param {string} email the email to check
 * @returns true if the email is 3-255 characters long, must contain an "@" sign, and 
 *  only contain letters, numbers, hyphens, underscores, or periods. False otherwise.
 */
let isValidEmail = (email) => {
    let isValid = false;
    let charRestriction = /^[A-Za-z0-9-_.@]+$/;
    if(isStringProvided(email) 
            && email.match(charRestriction) 
            && email.includes("@")
            && email.length >= MIN_EMAIL_LENGTH
            && email.length <= MAX_INPUT_LENGTH) {
        isValid = true;
    }
    return isValid;
}

/**
 * Checks the parameter to see if it is a valid password.
 * 
 * @param {string} password the password to check
 * @returns true if the password is 7-255 characters long and contain at least one 
 *  capital letter, one lowercase letter, one number, and one of the special characters 
 *  @#$%&*!? False otherwise.
 */
let isValidPassword = (password) => {
    let isValid = false;
    let charRestriction = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%&*!?])[A-Za-z0-9@#$%&*!?]+$/;
    if(isStringProvided(password) 
            && password.match(charRestriction) 
            && password.length >= MIN_PASSWORD_LENGTH 
            && password.length <= MAX_INPUT_LENGTH) {
    isValid = true;
    }
    return isValid
}

module.exports = { 
    isStringProvided,
    isValidName,
    isValidUsername,
    isValidEmail,
    isValidPassword
}