import {Http} from './http';

var http = new Http;

export class Resource {
  constructor(uri, responsePromise) {
    if (! uri) {
      throw new Error('Missing required uri argument to Resource');
    }

    Object.defineProperty(this, 'uri', {
      value: uri,
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
    return new Resource(this.uri, http.get(this.uri, params));
    // TODO: Any -> Any|Resource recursive deserialiser
  }
  post(data)  {
    // FIXME: must return Resource, not Promise[Resource] - but how do we know it's a Hyper resource? is it even?
    return new Resource(this.uri, http.post(this.uri, data));
  }
  // put(data)   {...}
  // patch(data) {...}
  // delete()    {...}

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

  follow(rel) {
    // FIXME: return lazy Resource, not Promise[Resource] - must make uri lazy too
    return this.getLink(rel).then(link => new Resource(link.href));
  }
  getLink(rel) {
    return this.links.then(links => links.find(l => l.rel == rel));
    // FIXME: throw error if missing link
  }

  // toString() {
  //   return 'Resource(', this.uri, ')';
  // }
}
