import {extractEntity} from './extractor';
import {isString, isDefined, defPropertyValue, defPropertyLazyValue} from './util';
import {assertStringParam, assertPromiseParam} from './util/asserts';

import uriTemplates from 'uri-templates';


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
   * @param {Object} adapters The HTTP and Promise adapters
   * @param {Any|Promise[Any]} response The response when querying this resource
   */
  constructor(uri, adapters, response) {
    // FIXME: terrible code relying on exception being thrown even in
    // valid cases (uri is a Promise); refactor using more gentle
    // monadic composable assertions, e.g.
    //   assertEither(assertStringParam(uri, 'uri'), assertPromiseParam(uri, 'uri')).throw;
    try {
      assertStringParam(uri, 'uri');
    } catch(e) {
      assertPromiseParam(uri, 'uri');
    }


    // TODO: assert http and promise adapters
    if (! adapters.http) {
      throw new Error('Missing required http adapter in adapters argument to Resource');
    }
    defPropertyValue(this, '$adapters', adapters);

    // uri may be a String or a Promise[String] - flatten to Promise[String]
    defPropertyValue(this, '$uri', adapters.promise.resolve(uri));

    // if string is loaded, expose it on the Resource
    if (isString(uri)) {
      defPropertyValue(this, 'uri', uri);
    }


    // Optional content response promise
    if (isDefined(response)) {
      // may be data or promise -- flatten to Promise
      defPropertyValue(this, '$response', adapters.promise.resolve(response));

      // if data is loaded, expose it on the Resource
      if (! isPromise(response)) {
        if (isEntity(response)) {
          if (isDefined(response.data))  { defPropertyValue(this, 'data',  response.data);  }
          if (isDefined(response.links)) { defPropertyValue(this, 'links', response.links); }

          // TODO: is this the interface we want?
          if (Array.isArray(response.data)) {
            if (isDefined(response.offset)) { defPropertyValue(this, 'offset', response.offset); }
            if (isDefined(response.length)) { defPropertyValue(this, 'length', response.length); }
            if (isDefined(response.total))  { defPropertyValue(this, 'total',  response.total);  }
          }
        } else {
          defPropertyValue(this, 'data', response);
        }
      }
    } else {
      // lazy GET to fetch response
      defPropertyLazyValue(this, '$response', () => this.get());
    }
    // FIXME: make private?
  }


  /* == HTTP methods == */

  /**
   * @return {Resource}
   */
  get(params = {}, implemOptions) {
    var getResp = this.getResponse(params, implemOptions);
    return new Resource(this.uri, this.config, getResp);
  }

  /**
   * @return {Promise[Any|Resource]}
   */
  post(data, implemOptions) {
    return this.uri.
      then(uri => this.http.post(uri, data, implemOptions)).
      then(parseResponse(this.config));
  }

  /**
   * @return {Resource}
   */
  put(data, implemOptions) {
    // FIXME: why not parseResponse?
    var putResp = this.uri.then(uri => this.http.put(uri, data, implemOptions)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PUT or, if none, the current response with the new data?
    return new Resource(this.uri, this.config, putResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Resource}
   */
  patch(data, implemOptions) {
    // FIXME: why not parseResponse?
    var patchResp = this.uri.then(uri => this.http.patch(uri, data, implemOptions)).then(extractEntity);
    // FIXME: Content of returned Resource is either the server response to
    // the PATCH or, if none, the current response with the patch?
    return new Resource(this.uri, this.config, patchResp.then(resp => resp /* or current... */));
  }

  /**
   * @return {Promise[Any|Resource]}
   */
  delete(implemOptions) {
    return this.uri.then(uri => this.http.delete(uri, implemOptions)).then(parseResponse(this.config));
  }


  /* == Resource content == */

  /**
   * @return {Promise[Entity|Any]}
   */
  getData() {
    // Return just the response if plain data, or data property if entity
    // TODO: if collection entity, store properties on data array
    return this.$response.then(extractData);
  }

  /**
   * @return {Promise[Array[Link]]}
   */
  getLinks() {
    // The response must be an entity
    return this.$response.then(ensureEntity).then(resp => resp.links || []);
  }


  /* == Helpers == */

  /**
   * @return {Resource}
   */
  follow(rel, params = {}) {
    var linkHref = this.getLink(rel).then(l => l.href).then(fillUriTemplate(params));
    // FIXME: substitute params here or later in get? both? default bind param here, allow late binding in GET later?
    return new Resource(linkHref, this.$adapters);
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
