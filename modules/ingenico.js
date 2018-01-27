"use strict";

var connectSdk = require('connect-sdk-nodejs');
let ml = require("./multilingual");
var price={"tiefighter":125099,"xwing":139999,"uwing":125099};

connectSdk.init({
  host: 'api-sandbox.globalcollect.com',
  scheme: 'https',
  port: 443,
  enableLogging: false, // defaults to false
  logger: undefined, // if undefined console.log will be used
  apiKeyId: process.env.INGENICO_API_ID,
  secretApiKey: process.env.INGENICO_API_KEY,
  integrator: 'Starforce'
});

exports.createCheckout = (returnUrl,shipType) => new Promise(async(resolve, reject) => {
  var body = {
    "hostedCheckoutSpecificInput": {
      "locale": ml.get("locale"),
      "returnUrl": returnUrl,
      "paymentProductFilters":{
        "restrictTo":{
          "products":[1,2,3,302,840]
        }
      },
      "tokens":process.env.INGENICO_TOKEN
    },
    "order": {
      "amountOfMoney": {
        "currencyCode": ml.get("currency"),
        "amount": price[shipType.replace('-','').replace(' ','').toLowerCase()]
      },
      "customer": {
        "billingAddress": {
          "city":"Amsterdam",
          "countryCode": "US"
        },
        "merchantCustomerId": "12345678"
      }
    }
  };
  //token 1: 3b54ce56-9387-4418-bdad-1dd8c5bf446e
  //token 2: 68bdf6f8-a109-4882-9dea-9a49a99c6286
  //  console.log(body);
  connectSdk.hostedcheckouts.create("3154", body, null, function (error, sdkResponse) {
    //  console.log("INGENICO1",error);
    //  console.log("INGENICO2",sdkResponse);
    if(sdkResponse!==null)
    resolve(process.env.INGENICO_SUBDOMAIN+sdkResponse.body.partialRedirectUrl)
    else
    resolve(null);
  });

});
