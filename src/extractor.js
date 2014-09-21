/*
if (acceptHeader === hyperMediaType) {
  response.data = extractEntity(response.data);
  // TODO: but the resource itself is not a hyper?
}
*/

import {Resource} from './resource';


function isArray(obj) {
  return obj instanceof Array;
}

function isObject(obj) {
  return obj instanceof Object;
}


function parseResponse(response, isEmbedded) {
  if (isEmbedded) {
    if (response && response.uri) {
      if (response.data) {
        response.data = parseData(response.data);
        // FIXME: don't mutate please
      }

      return new Resource(response.uri, response);
    } else {
      return parseData(response);
    }
  } else {
    if (response && response.data) {
      response.data = parseData(response.data);
      // FIXME: don't mutate please
    }
    return response;
  }
}

function parseData(responseData) {
  var data;

  switch (typeof responseData) {
  case 'object':
    // Array
    if (isArray(responseData)) {
      // TODO: IE8-friendly map?
      data = responseData.map(function(item) {
        return parseResponse(item, true);
      });
      break;

    // Object
    } else if (isObject(responseData)) {
      data = {};
      for (var key in responseData) {
        data[key] = parseResponse(responseData[key], true);
      }
      break;

    // Other (null...)
    } else {
      // fall through
    }

  // else: plain value, no need to recurse
  case 'string':
  case 'number':
  case 'boolean':
  case 'undefined':
  default:
    data = responseData;
    break;
  }

  return data;
}


export function extractEntity(response) {
  return parseResponse(response);
}
