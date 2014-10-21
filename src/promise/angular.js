import angular from 'angular';

export var mod = angular.module('anyPromise', []);


mod.factory('promise', ['$q', function($q) {

    var PromiseAdapter = function(func) {
      return $q(func);
    };

    // TODO: bind?
    PromiseAdapter.all = $q.all;
    PromiseAdapter.resolve = $q.when;
    // TODO: PromiseAdapter.cast ?

    return PromiseAdapter;
}]);
