angular.module('LungCancerScreening')
.controller('FormCtrl', ['$http', '$location', '$sessionStorage', function(http, location, session) {

  var self = this

  function init() {
    self.fields = {
      age:        null,
      gender:     null,
      type:       null,
      start_age:  null,
      stop_age:   null,
      cpd:        null,
      disease:    null,
      history:    null,
      units:      'us',
      primary:    null,
      secondary:  null,
      weight:     null,
      education:  null,
      race:       null
    }

    self.status = {
      loading:          false,
      results_disabled: false
    }
  }

  init()

  self.getParameters = function() {

    if (self.fields.type === 'current')
      self.fields.stop_age = self.fields.age

    return {
      'age':            Math.round(+self.fields.age),
      'bmi':            +self.validation.bmi().toFixed(2),
      'cpd':            +self.fields.cpd,
      'edu6':           +self.fields.education,
      'emp':            +self.fields.disease,
      'fam.lung.trend': +self.fields.history,
      'gender':         +self.fields.gender,
      'pkyr.cat':       +self.validation.pack_years(),
      'qtyears':        +self.fields.age - self.fields.stop_age,
      'race':           +self.fields.race,
      'smkyears':       +self.fields.stop_age - +self.fields.start_age
    }
  }

  // validation functions
  self.validation = {

    // converts pack-years to cpd
    cpd: function(value) {
      if (self.fields.type === 'current')
        return Math.round(20 * +value / (+self.fields.age - +self.fields.start_age))

      else if (self.fields.type === 'former')
        return Math.round(20 * +value / (+self.fields.stop_age - +self.fields.start_age))
    },

    // returns calculated pack-years
    pack_years: function() {
      if (self.fields.type === 'current')
        return (+self.fields.age - +self.fields.start_age) * +self.fields.cpd / 20

      else if (self.fields.type === 'former')
        return (+self.fields.stop_age - +self.fields.start_age) * +self.fields.cpd / 20
    },

    // returns calculated bmi
    bmi: function() {

      if (self.fields.units === 'metric') {
        var kg = +self.fields.weight
        var meters = +self.fields.secondary / 100
      } else if (self.fields.units === 'us') {
        var kg = 0.453592 * +self.fields.weight
        var meters = (+self.fields.secondary + 12 * +self.fields.primary) * 2.54 / 100
      }

      return kg / Math.pow(meters, 2)
    },

    // converts values between metric/imperial units
    convert_bmi_fields: function(target) {

      // convert from us to metric units
      if (target === 'metric') {
        self.fields.secondary = +(2.54 * (+self.fields.secondary + 12 * +self.fields.primary)).toPrecision(2) || ''
        self.fields.weight = +(0.453592 * +self.fields.weight).toPrecision(2) || ''

      // convert from metric to us
      } else if (target === 'us') {
        var inches = +self.fields.secondary / 2.54
        self.fields.primary = Math.floor(+inches / 12)
        self.fields.secondary = +(+inches % 12).toPrecision(2) || ''
        self.fields.weight = +(2.20462442018 * +self.fields.weight).toPrecision(2) || ''
      }
    },

    // converts bmi to weight 
    weight: function(bmi) {

      if (self.fields.units === 'metric') {
        var meters = +self.fields.secondary / 100
        return Math.round(bmi * Math.pow(meters, 2))

      } else if (self.fields.units === 'us') {
        var meters = (+self.fields.secondary + 12 * +self.fields.primary) * 2.54 / 100
        return Math.round(bmi * Math.pow(meters, 2) * 2.20462442018)
      }
    }
  }

  self.submit = function() {

    self.status.loading = true

    if (self.fields.type === 'current')
      self.fields.stop_age = self.fields.age

    session.params = {
      'age':            Math.round(+self.fields.age),
      'bmi':            +self.validation.bmi(),
      'cpd':            +self.fields.cpd,
      'edu6':           +self.fields.education,
      'emp':            +self.fields.disease,
      'fam.lung.trend': +self.fields.history,
      'gender':         +self.fields.gender,
      'pkyr.cat':       +self.validation.pack_years(),
      'qtyears':        +self.fields.age - +self.fields.stop_age,
      'race':           +self.fields.race,
      'smkyears':       +self.fields.stop_age - +self.fields.start_age
    }

    http.post('calculate/', JSON.stringify(session.params))
      .success(function(data) {
        if (data.length) {
          session.filepath = data.pop()
          session.data = data

          self.status.results_disabled = false
          location.path('/results')
        }
      })
      .error(function(data, status) {
        console.error(data, status)
      })
      .finally(function(data) {
        self.status.loading = false
      })
  }
}])



