# Theseus [![Build Status](https://travis-ci.org/argo-rest/theseus.svg?branch=master)](https://travis-ci.org/argo-rest/theseus)

A JavaScript client library for argo Hypermedia APIs.

*Under development.*

See NOTES file for underlying ideas.


## Usage

Sample usage:

``` javascript
import {Client} from 'theseus';
import {Http} from 'any-http-reqwest';
import {Promise} from 'any-promise-es6';

var client = new Client({http: new Http, promise: Promise});

var resource = client.resource('http://api.example.com'); // an API supporting argo
resource.data.then(data => console.log(data), err => console.error(err.stack));
resource.follow('search', {query: '42'}).data.then(data => console.log(data));
resource.follow('items').follow('create').post({foo: 'bar'}).then(resp => console.log(resp));
```

See the [theseus-examples](https://github.com/argo-rest/theseus-examples) repository for live code.


## Installation

Theseus is available as an ES6 module.

Using [jspm](https://jspm.io/), you can install it by running:

```
jspm install github:argo-rest/theseus
```
