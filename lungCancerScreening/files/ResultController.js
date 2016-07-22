angular.module('LungCancerScreening')
.controller('ResultCtrl', ['$http', '$location', '$sessionStorage', '$sce', function(http, location, session, sce) {

  var self = this

  self.session = session

  self.map = {
    race: {
      0: 'a White',
      1: 'a Black or African-American',
      2: 'a Hispanic',
      3: 'an Asian or Pacific Islander',
      4: 'a'
    },

    gender: {
      0: 'male',
      1: 'female'
    }
  }

  /* Draws a simple table with 1000 cells filled in based on units out of 1000 */
  self.drawGraph = function(units) {

    var table = angular.element('<table/>')
    table.attr('cellspacing', '0')
    table.attr('cellpadding', '0')
    table.attr('border', '1')

    units = Math.round(++units)
    for (var r = 0; r < 25; r ++) {
      var row = angular.element('<tr/>')

      for (var c = 0; c < 40; c ++) {
        var cell = angular.element('<td/>')
        cell.addClass('cell')

        if (--units > 0)
          cell.addClass('filled')

        row.append(cell)
      }

      table.prepend(row)
    }

    return sce.trustAsHtml(table[0].outerHTML)
  }



  exportPDF = function() {
    self.loading = true;
    if (window.location.hostname=='localhost') {
      url = 'http://' + window.location.hostname + ':9982/exportPDF/';
    }
    else {
      url = 'http://' + window.location.hostname + '/exportPDF/';
    };

    var data = "";
    var html = createPrintablePage();

    $http({
        method: 'POST', 
        url: url,
        data: html,        
        headers: { 'Accept':'application/json, text/plain, * / *'}
      }).success(function(data) {
          // var byteCharacters = atob(data);
          // var byteNumbers = new Array(byteCharacters.length);
          // for (var i = 0; i < byteCharacters.length; i++) {
          //     byteNumbers[i] = byteCharacters.charCodeAt(i);
          // };
          // var byteArray = new Uint8Array(byteNumbers);
          // var blob = new Blob([byteArray], {type: 'application/pdf'});
          // fileURL = URL.createObjectURL(blob)
          // window.location.replace(fileURL)
          window.location.replace(url+"?dir="+data) /* Use this if decided to go with static files on server */
      }).error(function(data) {

      }).finally(function(data) {
        $scope.loading = false;
      });
  };

  self.print = function() {
    print(createPrintablePage())
  };

  function createPrintablePage() {
    var html = "";
    var source  = $("#results .ng-hide").remove()
    var results = $("#results").html()

    html+= '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    html+= '<html xmlns="http://www.w3.org/1999/xhtml">';
    html+= '  <head>';
    html+= '  <title>National Lung Screening Trial</title>';
    html+= '  <meta http-equiv="X-UA-Compatible" content="IE=edge" />';
    html+= '  <meta http-equiv="Content-type" content="text/html; charset=UTF-8">';
    html+= '  <link href="' + $scope.base_url + 'files/2col.css" rel="stylesheet" type="text/css" media="all">';
    html+= '  <link href="' + $scope.base_url + 'files/pdf.css" rel="stylesheet" type="text/css" media="all">';
    html+= '  </head>';
    html+= '  <body>';
    html+= results;
    html+= '</body>';
    html+= '</html>';
    return html;
  };  

}])