"use strict";

const hbid = process.env.HUE_BRIDGE_ID;
const hbtoken = process.env.HUE_BRIDGE_TOKEN;
var hueEnabled=process.env.HUE_ENABLED === 'true';
const rp = require('request-promise');
var lights={xwing:process.env.HUE_XWING_ID,tiefighter:process.env.HUE_TIEFIGHTER_ID,uwing:process.env.HUE_UWING_ID};
var modes={orange:'{"on": true,"bri": 254,"hue": 6751,"sat": 254,"effect": "none","xy":[0.554,0.4116],"ct": 500,"alert": "lselect","colormode": "xy"}',
green:'{"on": true,"bri": 254,"hue": 22463,"sat": 254,"effect": "none","xy": [0.2339,0.652],"ct": 153,"alert": "select","colormode": "xy"}',
off:'{"on": false}'
}

exports.reset = resp => {
  doLight("tiefighter","off");
  doLight("xwing","off");
  doLight("uwing","off");
};

exports.light = async(shipType) => {
  doLight(shipType,"orange");
};
exports.blink = async(shipType) => {
  doLight(shipType,"green");
};
exports.off= async(shipType) => {
  doLight(shipType,"off");
};

var doLight = async(shipType,mode) =>{
  var options = {
    url: `https://client.meethue.com/api/0/lights/`+lights[shipType.replace('-','').replace(' ','').toLowerCase()]+`/state`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-token': hbtoken
    },
    body:modes[mode]
  }

  if(!process.env.DEVENV && hueEnabled) {
    var result= await rp(options);
    if(result.statusCode=='401'){
      console.log('unauthorized hue api return');
    }
    else{
     // console.log("hue result",result.body);
    }
  }
}
