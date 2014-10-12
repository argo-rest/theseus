import $ from 'jquery';

function getHeaders(request) {
  return {
    // FIXME: can't read Location?
    // 'Location':     request.getResponseHeader('Location'),
    'Content-Type': request.getResponseHeader('Content-Type')
  };
}

function dispatch(method, uri, data) {
  // Note: don't use jQuery Deferreds that are not A+-compliant
  return new Promise((resolve, reject) => {
    var req = $.ajax({
      url:      uri,
      method:   method,
      dataType: 'json',
      data:     data,
      // FIXME: not for GET though?
      // FIXME: or argo?
      contentType: 'application/json',
      headers: {
        'Accept': 'application/vnd.argo+json'
      },
      // TODO: optional?
      xhrFields: {
        withCredentials: true
      },
      success: (body, status, request) => resolve({uri: uri, body: body, status: status, headers: getHeaders(request)}),
      // FIXME: parse response iff json content-type
      error:   (request, status) => reject( {uri: uri, body: request.responseText, status: status, headers: getHeaders(request)})
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
