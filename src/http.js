// import reqwest from 'node_modules/reqwest/reqwest';
// // var reqwest = require();
// // import reqwest from 'npm:reqwest';
import reqwest from 'reqwest';

// console.log(reqwest);

// import request from 'npm:request';

// TODO extract another 'asPromise' helper

// function dispatch(method, uri, params) {
//   return new Promise((resolve, reject) => {
//     request[method](uri, params, (error, response) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(response);
//       }
//     });
//   });
// }

function dispatch(method, uri, params) {
  // Note: don't use reqwest's promises that are not A+-compliant
  return new Promise((resolve, reject) => {
    reqwest({
      // FIXME: apply uri template
      url:     uri.replace(/{.*}/, ''),
      // url:     uri,
      method:  method,
      data:    params,
      success: resolve,
      error:   reject
    });
  });
}

export class Http {
  get(uri, params) {
    return dispatch('get', uri, params);
  }

  post(uri, data) {
    return dispatch('post', uri, data);
  }

  put(uri, data) {
  }

  patch(uri, data) {
  }

  delete(uri) {
  }
}

