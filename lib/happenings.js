"use strict";
const { EventEmitter } = require("events");
const { distanceToShortenedURL } = require("./distance.js");

module.exports = (tweetStream, accountIDToFollow, locations) => {
  const emitter = new EventEmitter();

  tweetStream.on("connected", () => emitter.emit("connected"));

  tweetStream.on("error", err => emitter.emit("error", err));

  tweetStream.on("tweet", tweet => {
    if (!isDirectlyFromTheAccount(tweet, accountIDToFollow)) {
      // From https://dev.twitter.com/streaming/overview/request-parameters#follow, we only want
      // "Tweets created by the user", but the stream gives us a lot of other tweets (mostly when
      // somebody retweets the account).
      return;
    }

    let data;
    try {
      data = parseTweet(tweet);
    } catch (err) {
      emitter.emit("error", new Error(`Could not parse tweet with text '${tweet.text}'`));
      return;
    }
                 
    emitter.emit("error", new Error(`Tweet parse succeeded with text '${tweet.text}'`)); // $$$

    for (const location of locations) {
      distanceToShortenedURL(location, data.url).then(distance => {
        // Test: accept all tweets
        //if (distance < location.radius) {
          const dataWithCloseness = Object.assign({ distance, closeTo: location.label }, data);
          emitter.emit("spawn within range", dataWithCloseness);
        //}
      })
      .catch(err => emitter.emit("error", err));
    }
  });

  return emitter;
};

function isDirectlyFromTheAccount(tweet, accountIDToFollow) {
  return tweet.user.id_str === accountIDToFollow && !tweet.retweeted_status;
}

function parseTweet(tweet) {
    // emitter.emit("parsing tweet", tweet);
    // Example tweet:
    // Unown (IV: 42%, TTL: <10m 0s) [La Prospettiva, Nonantola, Emilia-Romagna, IT]: https://pogoapi.co/x/#44.66984,11.04337 …
    //
    // All we care about is the url, which embeds the location
    const url = tweet.entities.urls[0].expanded_url;
    
    return { url };
    // Example tweet:
    // Snorlax at 310 West End Ave, 10023 until 5:09:08 AM. #PokemonGo https://goo.gl/1D1hFz
    //
  //const [, pokemon, location, until] = /(.+) at (.+) until (.+). #PokemonGo (.*)/.exec(tweet.text);
  //const url = tweet.entities.urls[0].expanded_url;

  //return { pokemon, location, until, url };
}
