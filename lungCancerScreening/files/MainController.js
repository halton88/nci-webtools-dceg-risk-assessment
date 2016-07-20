angular.module('LungCancerScreening')

.controller("MainCtrl", ['$location', function(location) {
  var self = this;

  self.resultsDisabled = true
  self.changeUrl = location.path

}])
