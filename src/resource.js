import {Http} from './http';
import {extractEntity} from './extractor';

import uriTemplates from 'npm:uri-templates';

var http = new Http;

function fillUriTemplate(params = {}) {
  return function(uri) {
    return uriTemplates(uri).fillFromObject(params);
  };
}

function defPropertyValue(obj, propName, value) {
  Object.defineProperty(obj, propName, {
    value: value
  });
}

function defPropertyGetter(obj, propName, getter) {
  Object.defineProperty(obj, propName, {
    get: getter
  });
}

function isDefined(value) {
  return typeof value !== 'undefined';
}

function isEntity(response) {
  // FIXME: better heuristic! test class, based on response header?
  return 'data' in response || 'links' in response;
}

function ensureEntity(response) {
  if (! isEntity(response)) {
    throw new Error('expected entity response');
  }
  return response;
}

export class Resource {

  /**
   * @param {String|Promise[String]} uri The URI for this resource
   * @param {Any|Promise[Any]} response The response when querying this resource
   */
  constructor(uri, response) {
    if (! uri) {
      throw new Error('Missing required uri argument to Resource');
    }
    // TODO: check is String or Promise

    // uri may be a String or a Promise[String] - flatten to Promise[String]
    defPropertyValue(this, 'uri', Promise.resolve(uri));

    // Optional content response promise
    if (isDefined(response)) {
      // may be data or promise -- flatten to Promise
      defPropertyValue(this, 'response', Promise.resolve(response));
    } else {
      // lazy GET to fetch response
      // TODO: memoize?
      defPropertyGetter(this, 'response', () => this.getResponse());
    }
    // FIXME: make private?
  }

  getResponse(params = {}) {
    return this.uri.then(uri => http.get(uri, params)).then(extractEntity);
  }

  /* == HTTP methods == */

  /**
   * @return {Resource}
   */
  get(params = {}) {
    var getResp = this.getResponse(params);
    return new Resource(this.uri, getResp);
  }

  /**
   * @return {Promise[Any]}
   */
  post(data) {
    // TODO: extract top-level Resource in response if any
    return this.uri.then(uri => http.post(uri, data)).then(extractEntity);
  }

  /**
   * @return {Resource}
   */
  put(data) {
    var putResp = this.uri.then(uri => http.put(uri, data)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PUT or, if none, the current response with the new data?
    return new Resource(this.uri, putResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Resource}
   */
  patch(data) {
    var patchResp = this.uri.then(uri => http.put(uri, data)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PATCH or, if none, the current response with the patch?
    return new Resource(this.uri, patchResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Promise[Any]}
   */
  delete() {
    return this.uri.then(uri => http.delete(uri)).then(extractEntity);
  }


  /* == Resource content == */

  /**
   * @return {Promise[Entity|Any]}
   */
  get data() {
    // Return just the response if plain data, or data property if entity
    return this.response.then(resp => isEntity(resp) ? resp.data : resp);
  }

  /**
   * @return {Promise[Array[Link]]}
   */
  get links() {
    // TODO: does get() return a Promise[Resource], Promise[Any] data, Resource?
    // returns Promise[Any] of the data?
    return this.response.then(ensureEntity).then(resp => resp.links || []);
  }


  /* == Helpers == */

  /**
   * @return {Resource}
   */
  follow(rel, params = {}) {
    var linkHref = this.getLink(rel).then(l => l.href).then(fillUriTemplate(params));
    // FIXME: substitute params here or later in get? both? default bind param here, allow late binding in GET later?
    return new Resource(linkHref);
    // FIXME: propagation of errors if link missing?
  }

  /**
   * @return {Promise[Link]}
   */
  getLink(rel) {
    return this.links.
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
