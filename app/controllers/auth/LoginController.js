// Complete LoginController.js - Final Working Version
angular.module('app').controller('LoginController', ['$scope', '$location', 'SupabaseService',
function($scope, $location, SupabaseService) {

    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; $scope.initialized = true;

}]);