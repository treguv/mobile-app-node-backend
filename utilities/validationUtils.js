const MAX_INPUT_LENGTH = 255
const MIN_USERNAME_LENGTH = 2
const MAX_USERNAME_LENGTH = 30
const MIN_EMAIL_LENGTH = 3
const MIN_PASSWORD_LENGTH = 8

/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
let isStringProvided = (param) => 
    param !== undefined && param.length > 0

// TODO: Fix documentation
// Names only allow for capital letters, lowercase letters, and hyphens.
// Names can be from 1-255 chars long.
let isValidName = (name) => {
    let isValid = false;
    let charRestriction = /^[A-Za-z-]+$/;
    if(isStringProvided(name) 
        && name.match(charRestriction)
        && name.length <= MAX_INPUT_LENGTH) {
        isValid = true;
    }
    return isValid
}

// Usernames only allow for capital letters, lowercase letters, numbers, hyphens, and underscores.
// Usernames can be from 2-30 chars long.
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

// Emails only allow for capital letters, lowercase letters, numbers, hyphens, underscores, 
// periods, and an @ sign.
// Emails require an "@" symbol somewhere in the address.
// Emails can be from 3-255 chars long.
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

// Passwords must have a capital letter, a lowercase letter, a number, and at least one of the
// special characters !@#$%^&*()_+-=
// A password can be from 8-255 chars long.
let isValidPassword = (password) => {
    let isValid = false;
    let charRestriction = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+-=])[A-Za-z0-9!@#$%^&*()_+-=]+$/;
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