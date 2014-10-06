// import {Resource} from './src/argo/resource';
import {Client} from './src/argo/client';
import {Http} from './src/http/reqwest';
//import {Http} from './src/http/jquery';

var client = new Client({http: new Http});

var print = (...args) => console.log(...args);

var resource = client.resource('...'); // <- point to tag api
console.log(resource);
console.log(resource.get());
resource.data.then(data => console.log(data), err => console.error(err.stack));
resource.follow('tags', {query: 'victorian'}).data.then(data => console.log(data), err => console.error(err.stack));


resource.follow('missing').data.then(data => console.log(data), err => console.error(err.stack));
