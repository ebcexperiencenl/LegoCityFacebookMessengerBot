"use strict";

let messenger = require('./messenger'),
formatter = require('./formatter'),
hueLights = require('./hue-lights'),
uploads = require('./uploads');


exports.orderdone = (req,res) => {
  res.sendStatus(200);
  console.log('Payment Ingenico Done');
  hueLights.blink(req.query.shipType);
  setTimeout(function(){hueLights.off(req.query.shipType);},10000);
  messenger.send(formatter.recu(req.query.shipType), req.query.sender);
};

exports.Greetings = async(sender) => {
  console.log('start',sender);
  if(sender!="822485231243369"){
    let response=await messenger.getUserInfo(sender);
    messenger.send(formatter.bonjour(response), sender);
    setTimeout(function () {
      messenger.writingIcon(sender);
    }, 500)
    setTimeout(function () {
      messenger.send(formatter.information(response), sender);
    }, 2000)
  }
};

exports.InfoShip = (sender,text) => {
  let str=text.replace('-','').replace(' ','').toLowerCase();
  if(str.includes("xwing")){uploads.doAct(sender,"X-Wing");}
  else if (str.includes("tiefighter")){uploads.doAct(sender,"Tie Fighter");}
  else if (str.includes("uwing")){uploads.doAct(sender,"U-Wing");}
  else {messenger.send(formatter.shipChoice(), sender);}
};


exports.information = (sender) => {
  messenger.send(formatter.information(response), sender);
};
