import {Resource} from './resource';
import {defPropertyValue} from './util';


export class Client {
  constructor(adapters) {
    defPropertyValue(this, 'resourceOptions', {
      http:    adapters.http,
      promise: adapters.promise
    });
  }

  resource(uri) {
    // FIXME: swap argument order?
    return new Resource(uri, this.resourceOptions);
  }
}
