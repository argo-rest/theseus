import {extractEntity} from '../../src/theseus/extractor';
import {Resource} from '../../src/theseus/resource';

describe('extractEntity', () => {

    // Stub adapters
    const adapters = {
        http: {},
        promise: Promise
    };

    it('should be a function', () => {
        extractEntity.should.be.a('function');
    });

    it('should return an empty object when passed an empty object', () => {
        const entity = extractEntity({}, adapters);
        entity.should.deep.equal({});
    });

    it('should return the same object when passed an object with "data"', () => {
        const entity = extractEntity({data: 'abc'}, adapters);
        entity.should.deep.equal({data: 'abc'});
    });

    it('should map an embedded entity with uri and data to a Resource', () => {
        const entity = extractEntity({data: {foo: {uri: 'https://x', data: 'yes'}}}, adapters);
        entity.data.foo.should.be.instanceof(Resource);
        entity.data.foo.data.should.equal('yes');
    });

    it('should map an embedded entity with uri to a Resource with no data', () => {
        const entity = extractEntity({data: {foo: {uri: 'https://x'}}}, adapters);
        entity.data.foo.should.be.instanceof(Resource);
        expect(entity.data.foo.data).to.be.undefined;
    });
});
