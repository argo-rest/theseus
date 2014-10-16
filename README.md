# Theseus

A JavaScript client library for argo Hypermedia APIs.

*Under development*

See NOTES file for underlying ideas.


## Usage

Sample usage:

```
import {Client} from 'theseus';
import {Http} from 'theseus/src/http/reqwest';

var client = new Client({http: new Http});

var resource = client.resource('http://api.example.com'); // an API supporting argo
resource.data.then(data => console.log(data), err => console.error(err.stack));
resource.follow('search', {query: '42'}).data.then(data => console.log(data));
resource.follow('items').follow('create').post({foo: 'bar'}).then(resp => console.log(resp));
```

See the `examples` directory.


## Installation

Theseus is available as an ES6 module.

Using [jspm](https://jspm.io/), you can install it by running:

```
jspm install github:argo-rest/theseus
```
