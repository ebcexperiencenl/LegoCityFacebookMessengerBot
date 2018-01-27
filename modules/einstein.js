"use strict";
const jwt   = require('jsonwebtoken');
let request = require('request-promise');
var fs = require('fs');
var http=require('http');

const pvsUrl = process.env.EINSTEIN_VISION_URL;
const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = process.env.EINSTEIN_VISION_PRIVATE_KEY.replace(/\\n/g, '\n');
const model= process.env.EINSTEIN_VISION_MODEL;
const languagemodel= process.env.EINSTEIN_LANGUAGE_MODEL;
//model for Paris World Tour: 5YH2PZF43TNFZUD6HPL2RDAIRE
//model for amsterdam: J4OXP3DSZ3VHZ534BDKRZCPBXA
//model for dreamforce: 4GCQKVGS7QF3CEKX4ILPZPB6UI
process.on('unhandledRejection', r => console.log(r));

exports.classify = imageURL => new Promise(async(resolve, reject) => {
  var token = getToken();
  if(token===null){
    token = await updateToken();
  }
  let formData = {
    modelId: model,
    sampleLocation : imageURL
  }
  let visionresult = await doCall('/vision/predict',formData,token);
  console.log("vison result",visionresult);
  resolve(visionresult.probabilities[0]);
});

exports.feedback = (token,label,url) => new Promise(async(resolve, reject) => {
  var token = getToken();
  download(url,async function (filename){
    console.log(filename);
    if(token===null){
      token = await updateToken();
    }
    let formData = {
      modelId: model,
      expectedLabel: label,
      data: fs.createReadStream(filename)
    }
    console.log(formData);
    let visionresult = await doCall('/vision/feedback',formData,token);
    console.log("feedback result",visionresult);
    formData = {
      modelId: model
    }
    
    visionresult = await doCall('/vision/retrain',formData,token);
    
    resolve(visionresult);
  });
 
});

exports.getIntent = text => new Promise(async(resolve, reject) => {
  var token = getToken();
  if(token===null){
    token = await updateToken();
  }
  let formData = {
    modelId: languagemodel,
    document : text
  }
  let intentresult = await doCall('/language/intent',formData,token);
  resolve(intentresult.probabilities[0]);
});

exports.getStatus = () => new Promise(async(resolve, reject) => {
  var token = getToken();
  if(token===null){
    token = await updateToken();
  }
  
    var options = {
        simple:false,
        resolveWithFullResponse : true,
        url: `${pvsUrl}v2/vision/train/`+model,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
    }
  
      var result= await request(options);
    resolve(JSON.parse(result.body)) ;
});



var doCall = async(service,formData,jwtToken) => {
  var token = jwtToken || getToken();

  var options = {
      simple:false,
      resolveWithFullResponse : true,
      url: `${pvsUrl}v2`+service,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      },
      formData:formData
  }

    var result= await request(options);
    if(result.statusCode=='401'){
      console.log('unauthorized');
      token = await updateToken();
      options.headers.Authorization=`Bearer ${token}`;
      result= await request(options);
    }
  return JSON.parse(result.body);
};


var download = async(uri,dlcallback) => {  
  /*  var options = {
        simple:true,
        resolveWithFullResponse : true,
        url: url,
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
    }
      var result= await request(options);
      
      var uurl = require("url");
      var filename=uurl.parse(url).pathname.split('/').slice(-1).pop();
      
      fs.writeFileSync('/tmp/'+filename, result.body,"binary");
      return '/tmp/'+filename;

  
    var download = function(uri, filename, callback){*/

      var uurl = require("url");
      var filename=uurl.parse(uri).pathname.split('/').slice(-1).pop();
    
   /* request.head(uri,async  function(err, res, body){
      var t= await request(uri).pipe(fs.createWriteStream('/tmp/'+filename));
      dlcallback('/tmp/'+filename);
    });*/


    var tempFile = fs.createWriteStream('/tmp/'+filename);
    tempFile.on('open', function(fd) {
      request.head(uri,async  function(err, res, body){
        var t= await request(uri).pipe(tempFile);
        dlcallback('/tmp/'+filename);
      });
    });

  //};
  };


var updateToken = async() =>  {
    let argumentError;
    if (pvsUrl == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_URL, the base API URL (first arg)');
      return Promise.reject(argumentError);
    }
    if (accountId == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_ACCOUNT_ID, the account ID (second arg)');
      return Promise.reject(argumentError);
    }
    if (privateKey == null) {
      argumentError = new Error('updateToken requires EINSTEIN_VISION_PRIVATE_KEY, the private key (third arg)');
      return Promise.reject(argumentError);
    }

    var reqUrl = `${pvsUrl}v2/oauth2/token`;

    var rsa_payload = {
      "sub":accountId,
      "aud":reqUrl
    }

    var rsa_options = {
      header:{
        "alg":"RS256",
        "typ":"JWT"
       },
       expiresIn: '25h'
    }

    var token = jwt.sign(
      rsa_payload,
      privateKey,
      rsa_options
    );
    var options = {
      url: reqUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(token)}`
    }
    let result = await request(options);
      const granted = JSON.parse(result);
      const accessToken = granted.access_token;
      setToken(accessToken);
      return accessToken;
  };

  var oauthToken = null;

  function setToken(token) {
    oauthToken=token;
  }

  function getToken() {
    return oauthToken;
  }
