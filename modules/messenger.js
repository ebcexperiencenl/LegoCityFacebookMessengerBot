"use strict";

let request = require('request'),
    FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
let util = require('util')
let theZip = '';


exports.writingIcon = (recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipient},
            "sender_action":"typing_on"
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

exports.send = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipient},
            message: message
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else{
            console.log('Send: ', response.body);
        }
    });
};


exports.getUserInfo = (userId) => {

    return new Promise((resolve, reject) => {

        request({
            url: `https://graph.facebook.com/v2.6/${userId}`,
            qs: {fields:"first_name,last_name,profile_pic", access_token: FB_PAGE_TOKEN},
            method: 'GET',
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                console.log('getUserInfo: ', response.body);
                resolve(JSON.parse(response.body));
            }
        });

    });
};

exports.getSuggestion = (zip,rooms) => {

    console.log('zip 0: ', zip);
    zip = zip.substring(2);
    console.log('zip 1: ', zip);
    zip = parseInt(zip, 10);
    console.log('zip 2: ', zip);

    return new Promise((resolve, reject) => {

        request({
            url: `https://pio-octave-engine.herokuapp.com/queries.json`,
            method: 'POST',
            json : {
                voice_usage: zip,
                data_usage: rooms,
                text_usage: 0
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                console.log('zip 3: ', zip);
                console.log('No Error: ', response.body);
                var theResponse = JSON.stringify(response.body);
                console.log('theResponse: ', theResponse);
                resolve(JSON.parse(theResponse));
            }
        });

    });
};
