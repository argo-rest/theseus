import {Client} from '../src/theseus';
import {Http} from '../src/http/reqwest';
//import {Http} from './src/http/jquery';
import {Promise} from '../src/promise/es6';

var client = new Client({http: new Http, promise: Promise});

var print = (...args) => console.log(...args);

var resource = client.resource('...'); // <- point to tag api
console.log(resource);
console.log(resource.get());
resource.data.then(data => console.log(data), err => console.error(err.stack));
resource.follow('tags', {query: 'victorian'}).data.then(print);
resource.follow('tags').get({query: 'victorian'}).data.then(print);

// resource.follow('missing').data.then(data => console.log(data), err => console.error(err.stack));


var res = client.resource('http://localhost:8000/');
res.data.then(print);
res.links.then(print);
res.follow('books').data.then(print);
res.follow('books').follow('next').data.then(print);
res.follow('books').post({title: 'Nova', author: 'Samuel L. Delany'}).then(print);

var book = res.follow('books').post({title: 'Glasshouse', author: 'Charles Stross'});
book.then((r) => {
  r.uri.then(print);
  r.data.then(print);
  r.get().data.then(x => print("GET", x)).
    then(() => {
      return r.delete();
    }).then(() => {
      r.get().data.then(x => print("GET again", x), e => print("book is gone", e));
    });
});



function* foo() {
  console.log("first");

  var book = yield res.follow('books').post({title: 'Glasshouse', author: 'Charles Stross'});
  print(yield book.uri);
  var data = yield book.data;
  print(data);
  yield timeout(1000);

  var bookData = yield book.get().data;
  print("GET", bookData);
   // yield book.delete();
//  r.get().data.then(x => print("GET again", x));

  console.log("second");
}

spawn(foo)



function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function spawn(genF) {
  return new Promise((resolve, reject) => {
    var gen = genF();
    function step(nextF) {
      var next;
      try {
        next = nextF();
      } catch(e) {
        reject(next);
        return;
      }
      if (next.done) {
        resolve(next.value);
        return;
      }
      // Promise.cast(next.value).then(
      Promise.resolve(next.value).then(
        v => step(() => gen.next(v)),
        e => step(() => gen.throw(e))
      );
    }
    step(() => gen.next(undefined));
  });
}
