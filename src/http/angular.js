import angular from 'angular';

export var mod = angular.module('anyHttp', []);


function mapResponseFor(uri) {
  return function({data, status, headers: getHeader}) {
    var headers = {
      'Location':     getHeader('Location'),
      'Content-Type': getHeader('Content-Type')
    };

    return {uri: uri, body: data, status: status, headers: headers};
  };
}

mod.factory('dispatch', ['$http', '$q', function($http, $q) {
  return function(method, uri, extraParams = {}) {
    var mapResponse = mapResponseFor(uri);

    // TODO: return a Promise from the promise adapter
    var defer = $q.defer();

    var req = $http(angular.extend({
      url:     uri,
      method:  method,
      headers: {
        // FIXME: should be passed in as argument to make adapter more generic
        'Accept':       'application/vnd.argo+json',
        // FIXME: not for GET though? iff data?
        // FIXME: or argo?
        'Content-Type': 'application/json'
      },
      // TODO: optional:
      withCredentials: true
    }, extraParams)).then(
      r => defer.resolve(mapResponse(r)),
      r => defer.reject(mapResponse(r))
    );

    return defer.promise;
  };
}]);


mod.factory('http', ['dispatch', function(dispatch) {
  return {
    get(uri, params) {
      return dispatch('get', uri, {params: params});
    },

    post(uri, data) {
      return dispatch('post', uri, {data: data});
    },

    put(uri, data) {
      return dispatch('put', uri, {data: data});
    },

    patch(uri, data) {
      return dispatch('patch', uri, {data: data});
    },

    delete(uri) {
      return dispatch('delete', uri);
    }
  };
}]);

