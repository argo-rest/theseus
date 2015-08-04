import {Resource} from '../../src/theseus/resource';

describe('Resource', () => {

    it('should be a function', () => {
        Resource.should.be.a('function');
    });

    it('should throw an error if constructed without uri parameter', () => {
        (() => new Resource()).should.throw('Missing expected parameter uri');
    });

    it('should throw an error if constructed with invalid uri parameter', () => {
        // FIXME: broken asserts, should say 'of type string or Promise'
        (() => new Resource(['wrong'])).should.throw('Parameter uri expected to be of type Promise');
    });


    describe('new Resource', function() {
        var resource;
        var http;
        var exampleUri = 'http://api.example.com/path/endpoint';

        beforeEach(() => {
            http = {};
            resource = new Resource(exampleUri, {
                // FIXME: pass in mock
                http: http,
                promise: Promise
            });
        });

        it('should be an object', () => {
            resource.should.be.an('object');
        });

        describe('#get', function() {
            var response;

            beforeEach(() => {
                response = {
                    uri: exampleUri,
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.argo+json'
                    },
                    body: {data: {testKey: 'testVal'}}
                };
                http.get = sinon.stub().
                    // withArgs(exampleUri).
                    returns(Promise.resolve(response));
            });

            it('should be a function', () => {
                resource.get.should.be.a('function');
            });

            it('should return a Promise', () => {
                var res = resource.get();
                res.should.be.instanceof(Promise);
            });

            it('should GET the uri from the http adapter', () => {
                var res = resource.get();

                return res.then(() => {
                    // FIXME: once?
                    http.get.should.have.been.calledWith(exampleUri, {});
                });
            });

            it('should pass any param to the http adapter', () => {
                var params = {param1: 'val1', param2: 'val2'};
                var res = resource.get(params);

                return res.then(() => {
                   http.get.should.have.been.calledWith(exampleUri, params);
                });
            });

            // TODO: error if params are not an object

            it('should pass any implementation options to the http adapter', () => {
                var implemOptions = {opt1: 'val1'};
                var res = resource.get({}, implemOptions);

                return res.then(() => {
                   http.get.should.have.been.calledWith(exampleUri, {}, implemOptions);
                });
            });

            it('should return a Resource with the same uri', () => {
                var res = resource.get();
                return res.then(gotResource => {
                    gotResource.uri.should.equal(exampleUri);
                });
            });

            it('should return a Resource with the data', () => {
                var resp = resource.get();
                // TODO: check only one GET
                return resp.then(gotResource => {
                    gotResource.getData().should.eventually.deep.equal({testKey: 'testVal'});
                });
            });

            // TODO: exposed data if argo
            // TODO: exposed data if not argo
            // TODO: argo without data
            // TODO: not argo without data (204)

            // TODO: if error / 404
        });


        describe('#put', function() {
            var response;

            beforeEach(() => {
                response = {
                    uri: exampleUri,
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.argo+json'
                    },
                    body: {data: {testKey: 'newVal'}}
                };
                http.put = sinon.stub().
                    // withArgs(exampleUri).
                    returns(Promise.resolve(response));
            });

            it('should be a function', () => {
                resource.put.should.be.a('function');
            });

            it('should return a Promise', () => {
                var res = resource.put();
                res.should.be.instanceof(Promise);
            });

            it('should PUT the uri from the http adapter', () => {
                var res = resource.put();

                return res.then(() => {
                    // FIXME: once?
                    http.put.should.have.been.calledWith(exampleUri, undefined);
                });
            });

            it('should pass any data body to the http adapter', () => {
                var data = {param1: 'val1', param2: 'val2'};
                var res = resource.put(data);

                return res.then(() => {
                   http.put.should.have.been.calledWith(exampleUri, data);
                });
            });

            // TODO: error if data is not an object/array? or wrap in {data: ...}?

            it('should pass any implementation options to the http adapter', () => {
                var implemOptions = {opt1: 'val1'};
                var res = resource.put({}, implemOptions);

                return res.then(() => {
                   http.put.should.have.been.calledWith(exampleUri, {}, implemOptions);
                });
            });

            it('should return a Resource with the same uri', () => {
                var res = resource.put();
                return res.then(gotResource => {
                    gotResource.uri.should.equal(exampleUri);
                });
            });

            it('should return a Resource with the data returned by the server', () => {
                var resp = resource.put({testKey: 'newVal'});
                // TODO: check only one PUT
                return resp.then(gotResource => {
                    gotResource.getUri().should.eventually.equal(exampleUri);
                    gotResource.getData().should.eventually.deep.equal({testKey: 'newVal'});
                });
            });

            // TODO: exposed data if argo
            // TODO: exposed data if not argo
            // TODO: argo without data
            // TODO: not argo without data (204)

            // TODO: if error / 404
        });


        // TODO: post, patch, delete
        // TODO: follow

        // TODO: properties: uri, data
        // TODO: response

        // TODO: getData
        // TODO: getLinks

        describe('#getLink', function() {
            var response;

            beforeEach(() => {
                response = {
                    data: {testKey: 'testVal'},
                    links: [
                        {rel: 'testRel', href: 'http://example.com/path{?arg}'}
                    ]
                };

                resource = new Resource(exampleUri, {
                    // FIXME: pass in mock
                    http: http,
                    promise: Promise
                }, response);
            });

            it('should be a function', () => {
                resource.getLink.should.be.a('function');
            });

            it('should throw if called without a "rel" parameter', () => {
                (() => {
                    resource.getLink();
                }).should.throw('Missing expected parameter rel');
            });

            it('should throw if called with non-string "rel" parameter', () => {
                (() => {
                    resource.getLink({});
                }).should.throw('Parameter rel expected to be of type string');
            });

            it('should return a Promise fullfilled with the link', () => {
                const linkPromise = resource.getLink('testRel');
                linkPromise.should.be.instanceof(Promise);
                return linkPromise.should.eventually.deep.equal({rel: 'testRel', href: 'http://example.com/path{?arg}'});
            });

            it('should return a Promise rejected with an error if no such link', () => {
                const linkPromise = resource.getLink('missing');
                linkPromise.should.be.instanceof(Promise);
                return linkPromise.should.
                    eventually.be.rejected.and.
                    eventually.have.property('message', 'No link found for rel: missing');
            });
        });



        describe('#getAction', function() {

            describe('on resource with actions', function() {
                var action;
                var response;

                beforeEach(() => {
                    action = {
                        name: 'testAction',
                        href: exampleUri,
                        method: 'GET'
                    };
                    response = {
                        data: {testKey: 'testVal'},
                        actions: [action]
                    };

                    resource = new Resource(exampleUri, {
                        // FIXME: pass in mock
                        http: http,
                        promise: Promise
                    }, response);
                });

                it('should be a function', () => {
                    resource.getAction.should.be.a('function');
                });

                it('should throw if called without a "name" parameter', () => {
                    (() => {
                        resource.getAction();
                    }).should.throw('Missing expected parameter name');
                });

                it('should throw if called with non-string "action" parameter', () => {
                    (() => {
                        resource.getAction({});
                    }).should.throw('Parameter name expected to be of type string');
                });

                it('should return a Promise fullfilled with the action', () => {
                    const actionPromise = resource.getAction('testAction');
                    actionPromise.should.be.instanceof(Promise);
                    return actionPromise.should.eventually.deep.equal(action);
                });

                it('should return a Promise fullfilled with undefined if no such action', () => {
                    const actionPromise = resource.getAction('missing');
                    actionPromise.should.be.instanceof(Promise);
                    return actionPromise.should.eventually.be.undefined;
                });
            });


            describe('on resource without actions', function() {
                var response;

                beforeEach(() => {
                    response = {
                        data: {testKey: 'testVal'}
                    };

                    resource = new Resource(exampleUri, {
                        // FIXME: pass in mock
                        http: http,
                        promise: Promise
                    }, response);
                });

                it('should return a Promise fullfilled with undefined', () => {
                    const actionPromise = resource.getAction('someAction');
                    actionPromise.should.be.instanceof(Promise);
                    return actionPromise.should.eventually.be.undefined;
                });
            });
        });




        describe('#perform', function() {
            var responseGet, responseDelete;

            beforeEach(() => {
                var data = {
                    data: {testKey: 'testVal'},
                    actions: [{
                        name: 'testActionGet',
                        href: exampleUri,
                        method: 'GET'
                    }, {
                        name: 'testActionDelete',
                        href: exampleUri,
                        method: 'DELETE'
                    }]
                };

                resource = new Resource(exampleUri, {
                    // FIXME: pass in mock
                    http: http,
                    promise: Promise
                }, data);


                responseGet = {
                    uri: exampleUri,
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.argo+json'
                    },
                    body: {data: {testKey: 'testVal'}}
                };
                http.get = sinon.stub().
                    returns(Promise.resolve(responseGet));

                responseDelete = {
                    uri: exampleUri,
                    status: 204,
                    headers: {}
                };
                http.delete = sinon.stub().
                    returns(Promise.resolve(responseDelete));
            });

            it('should be a function', () => {
                resource.perform.should.be.a('function');
            });

            it('should throw if called without a "name" parameter', () => {
                (() => {
                    resource.perform();
                }).should.throw('Missing expected parameter name');
            });

            it('should throw if called with non-string "action" parameter', () => {
                (() => {
                    resource.perform({});
                }).should.throw('Parameter name expected to be of type string');
            });

            it('should perform the corresponding HTTP call', () => {
                const actionPromise = resource.perform('testActionGet');
                actionPromise.should.be.instanceof(Promise);
                return actionPromise.then(() => {
                    http.get.should.have.been.calledWith(exampleUri, {});
                });
            });

            it('should return a Promise of the corresponding response Resource', () => {
                const actionPromise = resource.perform('testActionGet');
                actionPromise.should.be.instanceof(Promise);
                return actionPromise.then(respResource => {
                    respResource.should.be.instanceof(Resource);
                    respResource.getData().should.eventually.deep.equal({testKey: 'testVal'});
                });
            });

            it('should return a Promise of undefined if the action results in an empty response', () => {
                const actionPromise = resource.perform('testActionDelete');
                actionPromise.should.be.instanceof(Promise);
                return actionPromise.then(respResource => {
                    expect(respResource).to.be.undefined;
                });
            });
        });
    });


});
