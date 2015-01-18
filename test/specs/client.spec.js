import {Client} from '../../src/theseus/client';
import {Resource} from '../../src/theseus/resource';

describe('Client', () => {

    it('should be a function', () => {
        Client.should.be.a('function');
    });

    it('should throw an error if constructed without adapters parameter', () => {
        // TODO: test instanceof error
        (() => new Client()).should.throw('Missing expected parameter adapters');
    });

    it('should throw an error if constructed with invalid apdaters parameter', () => {
        (() => new Client('wrong')).should.throw('Parameter adapters expected to be of type object');
    });

    it('should throw an error if constructed without http adapter', () => {
        (() => new Client({})).should.throw('Missing expected parameter adapters.http');
    });

    it('should throw an error if constructed with invalid http adapter', () => {
        (() => new Client({http: 'wrong'})).should.throw('Parameter adapters.http expected to be of type object');
    });

    it('should throw an error if constructed without promise adapter', () => {
        (() => new Client({http: {}})).should.throw('Missing expected parameter adapters.promise');
    });

    it('should throw an error if constructed with invalid promise adapter', () => {
        (() => new Client({http: {}, promise: 'wrong'})).should.throw('Parameter adapters.promise expected to be of type function');
    });


    describe('new Client', function() {
        var client;

        beforeEach(() => {
            client = new Client({
                // FIXME: pass in mock
                http: {},
                promise: Promise
            });
        });

        it('should be an object', () => {
            client.should.be.an('object');
        });


        describe('#resource', function() {

            it('should be a function', () => {
                client.resource.should.be.a('function');
            });

            it('should throw an exception if not passed a URL string', () => {
                (() => client.resource()).should.throw('Missing expected parameter uri');
            });

            it('should return a Resource object', () => {
                var resource = client.resource('http://api.example.com');
                resource.should.be.an('object');
                resource.should.be.instanceof(Resource);
            });
        });
    });
});
