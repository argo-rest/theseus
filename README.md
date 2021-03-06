# Theseus [![Build Status](https://travis-ci.org/argo-rest/theseus.svg?branch=master)](https://travis-ci.org/argo-rest/theseus)

A JavaScript client library for [argo](https://github.com/argo-rest/spec) Hypermedia APIs.

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
resource.get().then(resource => console.log(resource), err => console.error(err.stack));
resource.follow('search', {query: '42'}).getData().then(data => console.log(data));
resource.follow('items').follow('create').post({foo: 'bar'}).then(res => console.log(res));
```

See the [theseus-examples](https://github.com/argo-rest/theseus-examples) repository for live code.


## Installation

Theseus is available as an ES6 module.

Using [jspm](https://jspm.io/), you can install it by running:

```
jspm install theseus
```
