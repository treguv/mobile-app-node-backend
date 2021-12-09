const Pushy = require('pushy');

// Plug in your Secret API Key 
const pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {

    //build the message for Pushy to send
    var data = {
        "type": "msg",
        "message": message,
        "chatid": message.chatid
    }


    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Chat Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send contact to a specific client by the token
function sendContanctToIndividual(token) {

    //Specify a general contact request has been sent
    var data = {
        "type": "contact"
    }


    // Send push notification via the Send Notifications API 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Contact Push sent successfully!')
    })
}

module.exports = {
    sendMessageToIndividual,
    sendContanctToIndividual
}