import {extractEntity} from './extractor';
import {isDefined, defPropertyValue, defPropertyLazyValue} from './util';

import uriTemplates from 'npm:uri-templates';


var CONTENT_TYPE_ARGO = 'application/vnd.argo+json';

function fillUriTemplate(params = {}) {
  return function(uri) {
    return uriTemplates(uri).fillFromObject(params);
  };
}

// TODO: move to helper file

function isEntity(response) {
  // FIXME: better heuristic! test class, based on response header?
  return 'data' in response || 'links' in response;
}

// FIXME: better heuristic, or helper on Promise adapter?
function isPromise(obj) {
  return 'then' in obj;
}

function extractData(response) {
  return isEntity(response) ? response.data : response;
}

function ensureEntity(response) {
  if (! isEntity(response)) {
    throw new Error('expected entity response');
  }
  return response;
}

// FIXME: don't re-create a function every time
function parseResponse(config) {
  return function({uri, body, headers}) {
    if (headers['Content-Type'] === CONTENT_TYPE_ARGO) {
      var resourceUri = (typeof body === 'object' && body.uri) || headers['Location'] || uri;
      return new Resource(resourceUri, config, extractEntity(body, config));
    } else {
      return body;
    }
  };
}


export class Resource {

  /**
   * @param {String|Promise[String]} uri The URI for this resource
   * @param {Any|Promise[Any]} response The response when querying this resource
   */
  constructor(uri, config, response) {
    if (! uri) {
      throw new Error('Missing required uri argument to Resource');
    }
    // TODO: check is String or Promise

    // uri may be a String or a Promise[String] - flatten to Promise[String]
    defPropertyValue(this, 'uri', config.promise.resolve(uri));


    if (! config.http) {
      throw new Error('Missing required http adapter in config argument to Resource');
    }
    defPropertyValue(this, 'config', config);
    defPropertyValue(this, 'http', config.http);


    // Optional content response promise
    if (isDefined(response)) {
      // may be data or promise -- flatten to Promise
      defPropertyValue(this, 'response', config.promise.resolve(response));

      // if data is loaded, expose it on the Resource
      if (! isPromise(response)) {
        if (isEntity(response)) {
          if (response.data)  { defPropertyValue(this, 'data',  response.data);  }
          if (response.links) { defPropertyValue(this, 'links', response.links); }
        } else {
          defPropertyValue(this, 'data', response);
        }
      }
    } else {
      // lazy GET to fetch response
      defPropertyLazyValue(this, 'response', () => this.getResponse());
    }
    // FIXME: make private?
  }

  getResponse(params = {}) {
    // FIXME: parse error response too
    return this.uri.then(uri => this.http.get(uri, params)).then(parseResponse(this.config));
  }


  /* == HTTP methods == */

  /**
   * @return {Resource}
   */
  get(params = {}) {
    var getResp = this.getResponse(params);
    return new Resource(this.uri, this.config, getResp);
  }

  /**
   * @return {Promise[Any|Resource]}
   */
  post(data) {
    return this.uri.then(uri => this.http.post(uri, data)).then(parseResponse(this.config));
  }

  /**
   * @return {Resource}
   */
  put(data) {
    var putResp = this.uri.then(uri => this.http.put(uri, data)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PUT or, if none, the current response with the new data?
    return new Resource(this.uri, this.config, putResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Resource}
   */
  patch(data) {
    var patchResp = this.uri.then(uri => this.http.patch(uri, data)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PATCH or, if none, the current response with the patch?
    return new Resource(this.uri, this.config, patchResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Promise[Any|Resource]}
   */
  delete() {
    return this.uri.then(uri => this.http.delete(uri)).then(parseResponse(this.config));
  }


  /* == Resource content == */

  /**
   * @return {Promise[Entity|Any]}
   */
  getData() {
    // Return just the response if plain data, or data property if entity
    // TODO: if collection entity, store properties on data array
    return this.response.then(extractData);
  }

  /**
   * @return {Promise[Array[Link]]}
   */
  getLinks() {
    // The response must be an entity
    return this.response.then(ensureEntity).then(resp => resp.links || []);
  }


  /* == Helpers == */

  /**
   * @return {Resource}
   */
  follow(rel, params = {}) {
    var linkHref = this.getLink(rel).then(l => l.href).then(fillUriTemplate(params));
    // FIXME: substitute params here or later in get? both? default bind param here, allow late binding in GET later?
    return new Resource(linkHref, this.config);
    // FIXME: propagation of errors if link missing?
  }

  /**
   * @return {Promise[Link]}
   */
  getLink(rel) {
    return this.getLinks().
      then(links => links.find(l => l.rel == rel)).
      then(link => {
        if (! link) {
          throw new Error('No link found for rel: ' + rel);
        }
        // FIXME: why do we have to return a value? see Promise/A+
        return link;
      });
  }
}



/*

Resource vs Entity?

Resource
- get(), post(), etc
- data?

Entity
- follow()
- uri
- data
- links
- ?
+ PUT it as data

Response(content, headers, uri) => Resource
| iff header==argo, uri=uri in response or Location or requested uri
| uri optional
| data and links optional
| offset, limit, total optional - iff data == Array

Object => Resource  (i.e. embedded resource)
| iff "looks like" Resource (or has flag)
| uri required
| data and links optional


*/
