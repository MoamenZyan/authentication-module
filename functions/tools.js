#!/usr/bin/env node

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("Your API Key");

// Function To Get A Random Number
function getRandomInt() {
    return Math.floor(Math.random() * (10 - 1)) + 1;
}

// Function To Create OTP 6 Random Digits
function OTP() {
    let arr = [];
    for (let i = 0; i < 6; i++) {
        arr.push(getRandomInt());
    }
    return Number(arr.join(""));
}

// Sending OTP To User's Email
async function sendSecret(email) {
    const secret = OTP();
    const msg = {
        to: `${email}`, // Change to your recipient
        from: 'Your Sender Email', // Change to your verified sender
        subject: 'Your Subject',
        text: 'Text',
        html: `<strong>Verification Code: ${secret}</strong>`,
    }
        await sgMail.send(msg)
        return secret;
}



// Function To Calculate Age From DOB
function calcAge(DOB) {
    const today = new Date();
    const ageInMillies = today - DOB;
    const age = Math.floor(ageInMillies / (365.25 * 24 * 60 * 60 * 1000));
    return age;
}

module.exports = {
    calcAge, email_verify
}
