/* Creates a Default section model */
app.factory('BuildDefaultModel', ['CacheService', '$http', '$rootScope', function(Cache, $http, $rootScope) {
    function DefaultModel(parent) {
        var self = this;

        self.genTemplate = true;
        self.isDisabled = true;
        self.section = parent;
        self.placeHolderRows = [0, 1, 2, 3, 4];
    }
    DefaultModel.prototype = {
        init: function(cfg) {
            var self = this;
            var endpoint = cfg.templateEndpoint;

            if (cfg.sectionReference) {
                self.sectionReference = cfg.sectionReference;
                self.referredSectionData = angular.copy(Cache.getUiData(self.sectionReference));
            }

            self.templateType = cfg.templateType;
            self.templateRows = [];
            self.fileUploadEndpoint = cfg.fileUploadEndpoint;
            self.postUploadEndpoint = cfg.postUploadEndpoint;

            if (cfg.famHist) {
                self.columns = cfg.cols;
                self.referredSectionData.columns.unshift('Family history is not in the model');
                self.hasFamHist = cfg.famHist;
                self.famHist = self.referredSectionData.columns[0];
            } else {
                self.columns = cfg.cols ? cfg.cols : self.referredSectionData.columns;
                self.templateCols = self.columns;
            }

            if (self.templateType === 'staticDual') {
                /* Default to 2-column template vs. 3-column template */
                self.templateCols = self.columns[0];
                self.numOfCols = '2';
            }

            if (self.templateType === 'remote') {
                /* Remote data generation for template rows */
                self.getRemoteData(endpoint);
            }
        },
        selectTemplateColumns: function(val) {

            if (val === '2') {
                this.templateCols = this.columns[0];
            } else {
                this.templateCols = this.columns[1];
            }
        },
        exportToCsv: function(e) {
            var self = this;
            var filename = self.section.id;
        	var csvContent;

            e.preventDefault();
            e.stopPropagation();

            csvContent = 'data:text/csv;charset=utf-8,' + self.templateCols.join(',') + '\n';

            if (self.templateType === 'remote') {
                angular.forEach(self.templateRows, function(row) {
                    csvContent += row + '\n';

                });
            }

            console.log(csvContent);

    		encodedUri = encodeURI(csvContent);
    		window.open(encodedUri, '_self');
        },
        getRemoteData: function(url) {
            var self = this;
            var remoteUrl = 'http://' + window.location.hostname + '/absoluteRiskRest/' + url;
            var remoteData = {
                pathToVariableListFile: Cache.getSectionKey('variable_list', 'path_to_file'),
                pathToGenFormulaFile: Cache.getSectionKey('generate_formula', 'path_to_file'),
                formulaData: Cache.getSectionData('generate_formula')
            };

            $http.post(remoteUrl, JSON.stringify(remoteData))
               .success(function(data, status, headers, config) {
                   var re = /as.factor/gi;

                   self.templateRows = data;
               })
               .error(function(data, status, headers, config) {
                   console.log('status is: ', status);
               })
               .finally(function(data) {
                   console.log('finally, data is: ', data);
               });
        },
        postUploadActions: function(pathObj) {
            var self = this;

            var postUploadUrl = 'http://' + window.location.hostname + '/absoluteRiskRest/' + self.postUploadEndpoint;
            var postUploadData = {
                csvFilePath: pathObj['path_to_file'],
                rdataFilePath: Cache.getSectionKey(self.sectionReference, 'path_to_file')
            };

            console.log(postUploadData.csvFilePath, postUploadData.rdataFilePath);

            /* Passes in path to section CSV file, and path to referred section's RData file */
            $http.post(postUploadUrl, JSON.stringify(postUploadData))
               .success(function(data, status, headers, config) {
                   /* Store RData file path in global JSON object and open next section */
                   self.parseJsonModel(data);
                   self.section.broadcastSectionStatus();
               })
               .error(function(data, status, headers, config) {
                   console.log('status is: ', status);
               })
               .finally(function(data) {
                   console.log('finally, data is: ', data);
               });
        },
        getJsonModel: function() {
            /* For 'default' sections, only need to create {} with section id and possible csv/rdata file paths */
            Cache.setSectionData(this.section.id, {'id': this.section.id, 'path_to_file': ''} );

            /* Also store column and row template data for potential use by other sections */
            Cache.setUiData(this.section.id, {columns: this.templateCols, rows: this.templateRows });
        },
        parseJsonModel: function(model) {
            this.getJsonModel();

            if (model) {
                var filePath = model.path_to_file;

                Cache.setSectionKey(this.section.id, 'path_to_file', filePath);
            }
        }
    };

    return DefaultModel;
}]);
