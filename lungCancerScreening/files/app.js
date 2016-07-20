/**
 * @ngdoc overview
 * @name LungCancerScreening
 * @description
 * # This app contains methods for controlling the validation state of the form
 * # and for exporting calculation results to a file
 *
 * Main module of the application.
 */

angular.module('LungCancerScreening', ['ngStorage', 'ngRoute', 'ui.bootstrap', 'ui.validate'])

.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'form.html',
      controller: 'FormCtrl'
    })
    .when('/results', {
      templateUrl: 'results.html',
      controller: 'ResultCtrl'
    })
    .when('/pdf', {
      templateUrl: 'pdf.html',
      controller: 'ResultCtrl'
    })
    .otherwise({
      redirectTo: '/'
    })
})