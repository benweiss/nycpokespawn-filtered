#!/usr/bin/env node
"use strict";
const { EventEmitter } = require("events");
const unownbotFiltered = require("..");
const createLogger = require("../lib/logger.js");
const getConfig = require("../lib/config.js");
const fakeTweets1 = require("../test/fixtures/tweets1.json");
const fakeTweets2 = require("../test/fixtures/tweets2.json");

const stream = new EventEmitter();
const config = getConfig();
const logger = createLogger(console);
unownbotFiltered(stream, logger, config);

stream.emit("connected");

let delay = 0;
for (const tweet1 of fakeTweets1) {
  setTimeout(() => stream.emit("tweet", tweet1), delay);
  delay += 1000;
}
for (const tweet2 of fakeTweets2) {
    setTimeout(() => stream.emit("tweet", tweet2), delay);
    delay += 1000;
}
