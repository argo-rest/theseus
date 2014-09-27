import reqwest from 'reqwest';


function getHeaders(request) {
  return {
    // FIXME: can't read Location?
    // 'Location':     request.getResponseHeader('Location'),
    'Content-Type': request.getResponseHeader('Content-Type')
  };
}

function dispatch(method, uri, data) {
  // Note: don't use reqwest's promises that are not A+-compliant
  return new Promise((resolve, reject) => {
    var req = reqwest({
      url:     uri,
      method:  method,
      type:    'json',
      data:    data,
      // FIXME: not for GET though?
      // FIXME: or argo?
      contentType: 'application/json',
      headers: {
        'Accept': 'application/vnd.argo+json'
      },
// TODO: optional:
      crossOrigin: true,
      //withCredentials: true,
      success: (body) => resolve({uri: uri, body: body, headers: getHeaders(req.request)}),
      // FIXME: parse response iff json content-type
      error:   ()     => reject( {uri: uri, body: req.request.response, headers: getHeaders(req.request)})
    });
  });
}


export class Http {

  get(uri, params) {
    return dispatch('get', uri, params);
  }

  post(uri, data) {
    return dispatch('post', uri, JSON.stringify(data));
  }

  put(uri, data) {
    return dispatch('put', uri, JSON.stringify(data));
  }

  patch(uri, data) {
    return dispatch('patch', uri, JSON.stringify(data));
  }

  delete(uri) {
    return dispatch('delete', uri);
  }

}
