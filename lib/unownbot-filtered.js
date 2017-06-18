"use strict";
const twilio = require("twilio");
const createHappeningsEmitter = require("./happenings.js");

module.exports = (tweetStream, logger, config) => {
  const twilioClient = twilio(config.twilio.accountSID, config.twilio.authToken);

  const happenings = createHappeningsEmitter(
    tweetStream,
    config.accountIDToFollow,
    config.locations
  );

  logger.info("unownbot-filtered started" + (config.configLabel ? ` for ${config.configLabel}` : ""));

  happenings.on("connected", () => {
    logger.info("Connection to the Tweet stream successfully established");
  });

  happenings.on("error", err => {
    logger.info("An error occurred:");
    if (err.statusCode) {
      logger.error(`${err.message}
- statusCode: ${err.statusCode}
- code: ${err.code}
- twitterReply: ${err.twitterReply}`);
    } else {
      logger.error(err.stack);
    }
  });
    
  happenings.on("parsing tweet", tweet => {
    logger.info("Parsing tweet");
  });
    
  happenings.on("parse succeeded", err => {
    logger.info("Parse succeeded: " + `${err.message}`)
  });

  happenings.on("spawn out of range", data => {
    logger.info("Unown spawned out of range");
  });

  happenings.on("spawn within range", data => {
    logger.info("Unown spawned within range of " + `${data.closeTo}`);
                
    /* diagnostics
    console.log("Distance begin:");
    console.log(JSON.stringify(data.distance, undefined, 2));
    console.log("Distance end");
    console.log("closeTo begin:");
    console.log(JSON.stringify(data. closeTo, undefined, 2));
    console.log("closeTo end");
    console.log("Tweet begin:");
    console.log(JSON.stringify(data.tweet, undefined, 2));
    console.log("Tweet end");
    console.log("Tweet text begin:");
    console.log(JSON.stringify(data.tweet.text, undefined, 2));
    console.log("Tweet text end");
     */
                
    //const message = `${data.tweet.text}` + ` ${data.url}`;
    const message = `Unown spawned: http:/` + `/maps.google.com/?q=${data.latitude},${data.longitude}&ll=${data.latitude},${data.longitude}&z=14`
    
    logger.info("Message to send:" + `${message}`);
    // original:
    //const message = `${data.pokemon} spawned at ${data.location} until ${data.until}, ` +
    //`which is ${data.distance.toFixed(2)} km from ${data.closeTo}! ${data.url}`;
    //const message = `$Unown spawned, ${data.distance.toFixed(2)} km from ${data.closeTo}! ${data.url}`;
    //logger.event(message);
                
   for (const player of data.players) {
     twilioClient.sendMessage({
       to: player.cell,
       //to: config.numberToText,
       from: config.twilio.phoneNumber,
       body: message
       })
     .then(result => logger.info("Text sent to " + `${player.name}` + " at " + `${player.cell}`  + ", with SID " + `${result.sid}`))
     .catch(err => logger.error(`${err.message}
         - status: ${err.status}
         - code: ${err.code}
         - moreInfo: ${err.moreInfo}`));
   }
/*
    twilioClient.sendMessage({
      to: data.cell,
      //to: config.numberToText,
      from: config.twilio.phoneNumber,
      body: message
    })
    .then(result => logger.info("Text sent, with SID " + `${result.sid}`))
    .catch(err => logger.error(`${err.message}
    - status: ${err.status}
    - code: ${err.code}
    - moreInfo: ${err.moreInfo}`));
 */
  });
};
