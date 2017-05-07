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
// https://pogoapi.co/x/#33.60107,130.38025
//
// (original:)
// https://www.google.com/maps/place/40.8053786841,-73.9689989085/?dg=dbrw&newdg=1
//

exports.positionFromURL = url => {
    console.log("positionFromURL: begin, url = :");
    console.log(JSON.stringify(url, undefined, 2));
  const { pathname } = parseURL(url);
    console.log("positionFromURL: pathname = :");
    console.log(JSON.stringify(pathname, undefined, 2));
 
  const [, latitudeString, longitudeString] = /^\/x\/#([^,]+),([^/]+)\//.exec(pathname);
    
    console.log("positionFromURL: latitude and longitude");
    console.log(JSON.stringify(latitudeString, undefined, 2));
    console.log(JSON.stringify(longitudeString, undefined, 2));
    
    console.log("positionFromURL: end");
  
  // original:
  //const [, latitudeString, longitudeString] = /^\/maps\/place\/([^,]+),([^/]+)\//.exec(pathname);

  return { latitude: Number(latitudeString), longitude: Number(longitudeString) };
};

exports.distanceToShortenedURL = (startingPosition, shortenedURL) => {
  console.log(shortenedURL);
  return exports.followRedirects(shortenedURL).then(finalURL => {
    const finalPosition = exports.positionFromURL(finalURL);

    return haversine(startingPosition, finalPosition);
  });
};
