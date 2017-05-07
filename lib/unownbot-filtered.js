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
    logger.info("parse succeeded " + `${err.message}`)
  });

  happenings.on("spawn out of range", data => {
    logger.info("Unown spawned out of range");
  });

  happenings.on("spawn within range", data => {
    //const message = `${data.pokemon} spawned at ${data.location} until ${data.until}, ` +
    //`which is ${data.distance.toFixed(2)} km from ${data.closeTo}! ${data.url}`;
    //const message = `$Unown spawned, ${data.distance.toFixed(2)} km from ${data.closeTo}! ${data.url}`;
    //logger.event(message);
    logger.info("Unown spawned within range");

    twilioClient.sendMessage({
      to: config.numberToText,
      from: config.twilio.phoneNumber,
      body: message
    })
    //.then(result => logger.info(`${data.pokemon} text sent, with SID ${result.sid}`))
    .then(result => logger.info("Text sent, with SID " + `${result.sid}`))
    .catch(err => logger.error(`${err.message}
- status: ${err.status}
- code: ${err.code}
- moreInfo: ${err.moreInfo}`));
  });
};
