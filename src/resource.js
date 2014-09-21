import {Http} from './http';

import uriTemplates from 'npm:uri-templates';

var http = new Http;

export class Resource {
  constructor(uri, responsePromise) {
    if (! uri) {
      throw new Error('Missing required uri argument to Resource');
    }

    var uriPromise;
    if (typeof uri === 'string') {
      uriPromise = Promise.resolve(uri);
    } else if (typeof uri.then === 'function') {
      uriPromise = uri;
    }

    Object.defineProperty(this, 'uri', {
      value: uriPromise,
      enumerable: true,
      writable: false
      // FIXME: configurable? enumerable?
    });

    // Optional content response promise
    if (typeof responsePromise !== 'undefined') {
      Object.defineProperty(this, 'responsePromise', {
        value: responsePromise,
        writable: false
        // FIXME: NOT READABLE? configurable? enumerable?
      });
      // FIXME: read-only
    }
  }

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

  follow(rel, params) {
    // FIXME: return lazy Resource, not Promise[Resource] - must make uri lazy too
    // return this.getLink(rel).then(link => new Resource(link.href));
    var linkHref = this.getLink(rel).then(l => l.href).then(href => {
      return uriTemplates(href).fillFromObject(params || {});
    });
    // FIXME: substitute params here or later in get? both? default bind param here, allow late binding in GET later?
    return new Resource(linkHref);
    // FIXME: propagation of errors if link missing?
  }
  getLink(rel) {
    return this.links.then(links => links.find(l => l.rel == rel));
    // FIXME: throw error if missing link
  }

  // toString() {
  //   return 'Resource(', this.uri, ')';
  // }
}
