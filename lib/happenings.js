"use strict";
const { EventEmitter } = require("events");
const { distanceToShortenedURL } = require("./distance.js");

module.exports = (tweetStream1, tweetStream2, accountIDToFollow1, accountIDToFollow2, locations) => {
  const emitter = new EventEmitter();

  tweetStream1.on("connected", () => emitter.emit("connected"));
  tweetStream2.on("connected", () => emitter.emit("connected"));

  tweetStream1.on("error", err => emitter.emit("error", err));
  tweetStream2.on("error", err => emitter.emit("error", err));

  tweetStream1.on("tweet", tweet => {
    if (!isDirectlyFromTheAccount(tweet, accountIDToFollow1)) {
      // From https://dev.twitter.com/streaming/overview/request-parameters#follow, we only want
      // "Tweets created by the user", but the stream gives us a lot of other tweets (mostly when
      // somebody retweets the account).
      return;
    }
    
    //console.log("Tweet data begin");
    //console.log(JSON.stringify(tweet, undefined, 2));
    //console.log("Tweet data end");

    let finalPosition;
    try {
      finalPosition = parseTweet(tweet);
      
      // Diagnostic
      console.log("Parsed data:");
      console.log(JSON.stringify(finalPosition, undefined, 2));
      console.log("Parsed data end");
      
                 
    } catch (err) {
      emitter.emit("error", new Error(`Could not parse tweet with text '${tweet.text}'`));
      return;
    }
    
    // Todo - this should be passed as a string and not an Error
    emitter.emit("parse succeeded", new Error(`Tweet parse succeeded with text '${tweet.text}'`));
                 
    const finalPosition_ = finalPosition;

    for (const location of locations) {
      const distance = distanceToShortenedURL(location, finalPosition_);
      if (distance < location.radius) {
        const dataWithCloseness = Object.assign({ distance, tweet, closeTo: location.label, players: location.players }, finalPosition_);
        emitter.emit("spawn within range", dataWithCloseness);
      }
      else {
      }
    }
  });
  
  tweetStream2.on("tweet", tweet => {
    if (!isDirectlyFromTheAccount(tweet, accountIDToFollow2)) {
      // From https://dev.twitter.com/streaming/overview/request-parameters#follow, we only want
      // "Tweets created by the user", but the stream gives us a lot of other tweets (mostly when
      // somebody retweets the account).
      return;
    }

    let finalPosition;
    try {
      finalPosition = parseTweet(tweet);
      
      // Diagnostic
      console.log("Parsed data:");
      console.log(JSON.stringify(finalPosition, undefined, 2));
      console.log("Parsed data end");
      
                 
    } catch (err) {
      emitter.emit("error", new Error(`Could not parse tweet with text '${tweet.text}'`));
      return;
    }
    
    // Todo - this should be passed as a string and not an Error
    emitter.emit("parse succeeded", new Error(`Tweet parse succeeded with text '${tweet.text}'`));

    const finalPosition_ = finalPosition;

    for (const location of locations) {
      const distance = distanceToShortenedURL(location, finalPosition_);
      if (distance < location.radius) {
        const dataWithCloseness = Object.assign({ distance, tweet, closeTo: location.label, players: location.players }, finalPosition_);
        emitter.emit("spawn within range", dataWithCloseness);
      }
      else {
      }
    }
  });

  return emitter;
};

function isDirectlyFromTheAccount(tweet, accountIDToFollow) {
  return tweet.user.id_str === accountIDToFollow && !tweet.retweeted_status;
}

function parseTweet(tweet) {
  // Example tweet (@KingArt1993):
  // **Unown T ** 51.54015,-0.23135
    
  // Search for string 'Unown' in tweet text
  var n = tweet.text.indexOf("Unown");
    if (n == -1) {
        console.log("String 'Unown' not found in tweet'");
        return { };
    }
  
  var chopped = tweet.text.split(" ");
  var coords = chopped[chopped.length - 1].split(",");
    if (coords.length != 2) {
        console.log("Unable to parse coords");
        return { };
    }
  // construct an url
  //const url = "https://pogoapi.co/x/#" + chopped[chopped.length - 1];
    
    return { latitude: coords[0], longitude: coords[1] };
    
    /* original:

  // Example tweet (@UnownBot):
  // Unown (K) (IV: 33%, TTL: &lt;10m 0s) [Chicago, Illinois, US]: https://t.co/gaGzLLFLjm
  //
  // What we want is the expanded url, which embeds the GPS location, e.g.:
  //
  // https://pogoapi.co/x/#41.79195,-87.60672

  const url = tweet.entities.urls[0].expanded_url; // expanded URL

  return { url };
     */
}
