import {Http} from './http';

import uriTemplates from 'npm:uri-templates';

var http = new Http;

function fillUriTemplate(params) {
  return function(uri) {
    return uriTemplates(uri).fillFromObject(params || {});
  };
}



export class Resource {
  constructor(uri, responsePromise) {
    if (! uri) {
      throw new Error('Missing required uri argument to Resource');
    }

    // uri may be a String or a Promise[String] - flatten to Promise[String]
    var uriPromise = Promise.resolve(uri);
    Object.defineProperty(this, 'uri', {
      value: uriPromise,
      enumerable: true,
      configurable: false,
      writable: false
    });

    // Optional content response promise
    if (typeof responsePromise !== 'undefined') {
      Object.defineProperty(this, 'responsePromise', {
        value: responsePromise,
        enumerable: false,
        configurable: false,
        writable: false
        // FIXME: NOT READABLE?
      });
      // FIXME: read-only
    }
    // TODO: else lazy GET?
  }


  /* == HTTP methods == */

  get(params) {
    // FIXME: must return Resource, not Promise[Resource] - but how do we know it's a Hyper resource?
    return new Resource(this.uri, this.uri.then(uri => http.get(uri, params)));
    // TODO: Any -> Any|Resource recursive deserialiser
  }
  post(data)  {
    // FIXME: return Resource or Promise[Any|Resource]? how do we know it's a Hyper resource? is it even?
    return new Resource(this.uri, this.uri.then(uri => http.post(uri, data)));
  }
  put(data) {
    var putResp = this.uri.then(uri => http.put(uri, data));
    // FIXME: Content of returned Resource is either the server response to
    // the PUT or, if none, the current response with the new data?
    return new Resource(this.uri, putResp.then(resp => resp /* or current... */));
  }
  // patch(data) {...}
  delete() {
    return this.uri.then(uri => http.delete(uri));
  }


  /* == Resource content == */

  get data() {
    // TODO: does get() return a Promise[Resource], Promise[Any] data, Resource?
    // returns Promise[Any] of the data?
    if (this.hasOwnProperty('responsePromise')) {
      return this.responsePromise.then(resp => resp.data);
    } else {
      // FIXME: so lazy resource must allow self-promise resolution?
      return this.get().data;
    }
    // FIXME: icky?
  }

  get links() {
    // TODO: does get() return a Promise[Resource], Promise[Any] data, Resource?
    // returns Promise[Any] of the data?
    if (this.hasOwnProperty('responsePromise')) {
      return this.responsePromise.then(resp => resp.links || []);
    } else {
      // FIXME: so lazy resource must allow self-promise resolution?
      return this.get().links;
    }
    // FIXME: icky?
  }


  /* == Helpers == */

  follow(rel, params) {
    var linkHref = this.getLink(rel).then(l => l.href).then(fillUriTemplate(params));
    // FIXME: substitute params here or later in get? both? default bind param here, allow late binding in GET later?
    return new Resource(linkHref);
    // FIXME: propagation of errors if link missing?
  }

  getLink(rel) {
    return this.links.then(links => links.find(l => l.rel == rel));
    // FIXME: throw error if missing link
  }
}
