import 'jquery';
import "angular";

var ByobApp = angular.module("ByobApp", []);
ByobApp.controller('ClickCtrl', ['$rootScope', function($rootScope) {
    this.doClick = function() {
      $rootScope.$broadcast('my.event');
    };
}]);

ByobApp.controller('TestCtrl', ['$rootScope', function($rootScope) {
    $rootScope.$on('my.event', function() {
      alert('test: my.event');
    });
}]);

