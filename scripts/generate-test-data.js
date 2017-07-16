"use strict";
const Twit = require("twit");
const config = require("../config.json");
const fs = require("fs");
const path = require("path");

const destFilename1 = path.resolve(__dirname, "../test/fixtures/tweets1.json");
const destFilename2 = path.resolve(__dirname, "../test/fixtures/tweets2.json");

const t = new Twit({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
});

t.get("statuses/user_timeline", {
  user_id: config.accountIDToFollow1,
  trim_user: true,
  exclude_replies: false,
  include_rts: true
})
.then(({ data }) => {
  fs.writeFileSync(destFilename1, JSON.stringify(data, undefined, 2));
})
.catch(e => {
  console.error(e.stack);
  process.exit(1);
});

t.get("statuses/user_timeline", {
  user_id: config.accountIDToFollow2,
  trim_user: true,
  exclude_replies: false,
  include_rts: true
})
.then(({ data }) => {
  fs.writeFileSync(destFilename2, JSON.stringify(data, undefined, 2));
})
.catch(e => {
  console.error(e.stack);
  process.exit(1);
});
