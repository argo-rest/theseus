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
                    headers: {},
                    body: {data: {testKey: 'testVal'}}
                };
                http.get = sinon.stub().
                    // withArgs(exampleUri).
                    returns(Promise.resolve(response));
            });

            it('should be a function', () => {
                resource.get.should.be.a('function');
            });

            it('should return a Resource', () => {
                var resp = resource.get();
                resp.should.be.instanceof(Resource);
            });

            it('should GET the uri from the http adapter', () => {
                var resp = resource.get();

                return resp.response.then(() => {
                    // FIXME: once?
                    http.get.should.have.been.calledWith(exampleUri, {});
                });
            });

            it('should pass any param to the http adapter', () => {
                var params = {param1: 'val1', param2: 'val2'};
                var resp = resource.get(params);

                return resp.response.then(() => {
                   http.get.should.have.been.calledWith(exampleUri, params);
                });
            });

            // TODO: error if params are not an object

            it('should pass any implementation options to the http adapter', () => {
                var implemOptions = {opt1: 'val1'};
                var resp = resource.get({}, implemOptions);

                return resp.response.then(() => {
                   http.get.should.have.been.calledWith(exampleUri, {}, implemOptions);
                });
            });

            it('should return a Resource with the same uri', () => {
                var resp = resource.get();
                return resp.uri.should.eventually.equal(exampleUri);
            });

            it('should return a Resource with the data', () => {
                var resp = resource.get();
                // TODO: check only one GET
                return resp.getData().should.eventually.deep.equal({testKey: 'testVal'});
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
        // TODO: getLink, getLinks

    });
});
