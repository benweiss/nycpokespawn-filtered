#!/usr/bin/env node
"use strict";
const unownbotFiltered = require("..");
const createTweetStream = require("../lib/twitter.js");
const createLogger = require("../lib/logger.js");
const getConfig = require("../lib/config.js");

const config = getConfig();

if (config) {
  const tweetStream1 = createTweetStream(config.twitter, config.accountIDToFollow1);
  const tweetStream2 = createTweetStream(config.twitter, config.accountIDToFollow2);
  const logger = createLogger(console);
  unownbotFiltered(tweetStream1, tweetStream2, logger, config);
}
