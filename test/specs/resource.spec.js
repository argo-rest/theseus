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

        // TODO: post, put, patch, delete
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

    });
});
