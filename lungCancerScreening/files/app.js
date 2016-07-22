/**
 * @ngdoc overview
 * @name LungCancerScreening
 * @description
 * # This app contains methods for controlling the validation state of the form
 * # and for exporting calculation results to a file
 *
 * Main module of the application.
 */

angular.module('LungCancerScreening', 
[ 'ngMessages',
  'ngResource',
  'ngRoute',
  'ngStorage',
  'ui.bootstrap'])

.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'form.html',
      controller: 'FormCtrl',
      controllerAs: 'form'
    })

    .when('/results', {
      templateUrl: 'results.html',
      controller: 'ResultCtrl',
      controllerAs: 'results'
    })
    /*
    .when('/pdf', {
      templateUrl: 'pdf.html',
      controller: 'ResultCtrl',
      controllerAs: 'results'
    })*/
    .otherwise({
      redirectTo: '/'
    })
})