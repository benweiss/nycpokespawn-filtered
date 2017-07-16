"use strict";
const https = require("https");
const { parse: parseURL } = require("url");
const haversine = require("haversine");

exports.followRedirects = function followRedirects(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, res => {
      request.abort();

      if (res.headers.location) {
        resolve(followRedirects(res.headers.location));
      } else {
        resolve(url);
      }
    })
    .on("error", reject);
  });
};

// Extracts { latitude, longitude } from URLs of the form
//
// https://pogoapi.co/x/#33.60107,130.38025
//
// (original:)
// https://www.google.com/maps/place/40.8053786841,-73.9689989085/?dg=dbrw&newdg=1
//

exports.positionFromURL = url => {
    console.log("positionFromURL: begin, url = :");
    console.log(JSON.stringify(url, undefined, 2));
    
    var splitUrl = url.split('#');
    
    console.log("positionFromURL: splitUrl = :");
    console.log(JSON.stringify(splitUrl, undefined, 2));
    
    var coords = splitUrl[1].split(',');
    
    //console.log("latitude and longitude:");
    //console.log(coords[0]);
    //console.log(coords[1]);
    
    return { latitude: Number(coords[0]), longitude: Number(coords[1]) };
};

exports.distanceToShortenedURL = (startingPosition, finalPosition) => {
  return haversine(startingPosition, finalPosition);
};
