import {Resource} from './src/resource';

var resource = new Resource('...'); // <- point to tag api
console.log(resource);
console.log(resource.get());
resource.data.then(data => console.log(data), err => console.error(err.stack));
resource.follow('tags').data.then(data => console.log(data), err => console.error(err.stack));
