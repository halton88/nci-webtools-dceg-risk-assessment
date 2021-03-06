angular.module('Arc')
.factory('ModalService', ['$uibModal', function(modal) {
    return {
        dialog: function(title, contents, messages) {
            modal.open({
                templateUrl: 'templates/modal.html',
                controllerAs: 'modal',
                controller: ['$uibModalInstance', function(modalInstance) {
                    var self = this;
                    self.title = title;
                    self.contents = contents;
                    self.messages = messages;

                    self.close = function() {
                        modalInstance.dismiss(0);
                    }
                }]
            });
        }
    }
}]);
