import {Resource} from './resource';
import {isArray, isObject, isDefined} from './util';


function contains(arr, item) {
  return arr.indexOf(item) !== -1;
}

function isEntity(obj, isEmbedded) {
  var hasRequiredProps;
  if (isEmbedded) {
    hasRequiredProps = 'uri' in obj;
  } else {
    // FIXME: required for response entities?
    hasRequiredProps = 'data' in obj;
  }

  var keys = Object.keys(obj);
  var entityProperties = ['uri', 'data', 'links'];
  var hasOnlyEntityProps = keys.every(key => contains(entityProperties, key));

  return hasRequiredProps && hasOnlyEntityProps;
}

function parseResponse(response, isEmbedded, config) {
  if (isEmbedded) {
    if (response && isEntity(response, isEmbedded)) {
      if (isDefined(response.data)) {
        response.data = parseData(response.data, config);
        // FIXME: don't mutate please
      }

// FIXME: hack, pass in config
      return new Resource(response.uri, config, response);
    } else {
      return parseData(response, config);
    }
  } else {
    if (response && isEntity(response, isEmbedded) && isDefined(response.data)) {
      response.data = parseData(response.data, config);
      // FIXME: don't mutate please
    }
    return response;
  }
}

function parseData(responseData, config) {
  var data;

  switch (typeof responseData) {
  case 'object':
    // Array
    if (isArray(responseData)) {
      // TODO: IE8-friendly map?
      data = responseData.map(function(item) {
        return parseResponse(item, true, config);
      });
      break;

    // Object
    } else if (isObject(responseData)) {
      data = {};
      for (var key in responseData) {
        data[key] = parseResponse(responseData[key], true, config);
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


export function extractEntity(response, config) {
  return parseResponse(response, false, config);
}
