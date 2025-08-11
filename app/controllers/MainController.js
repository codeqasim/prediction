// Main Controller - Handles global app state
angular.module('app').controller('MainController', ['$scope', '$location', '$rootScope', 'AuthService', 'UserService',
function($scope, $location, $rootScope, AuthService, UserService) {
    // Current user data
    $scope.currentUser = null;
    $scope.isAuthenticated = false;

    // Navigation active state
    $scope.isActive = function(path) {
        return $location.path() === path;
    };

    // Check if current route starts with path (for sub-routes)
    $scope.isActiveParent = function(path) {
        return $location.path().startsWith(path);
    };

    // Navigation function
    $scope.navigateTo = function(path) {
        $location.path(path);
    };

    // Logout function
    $scope.logout = function() {
        $rootScope.setLoading(true);
        AuthService.logout().then(function() {
            $scope.currentUser = null;
            $scope.isAuthenticated = false;
            $location.path('/');
            $rootScope.setLoading(false);
        }).catch(function(error) {
            console.error('Logout error:', error);
            $rootScope.setLoading(false);
        });
    };

    // Watch for authentication changes
    $scope.$watch(function() {
        return AuthService.isAuthenticated();
    }, function(newVal) {
        $scope.isAuthenticated = newVal;
        if (newVal) {
            // User is authenticated, get user data
            UserService.getCurrentUser().then(function(userData) {
                $scope.currentUser = userData;
                // Remove $scope.$apply() as promises automatically trigger digest cycle
            }).catch(function(error) {
                console.error('Error getting user data:', error);
            });
        } else {
            $scope.currentUser = null;
        }
    });

    // Listen for auth state changes
    $rootScope.$on('auth:login', function(event, userData) {
        $scope.currentUser = userData;
        $scope.isAuthenticated = true;
    });

    $rootScope.$on('auth:logout', function() {
        $scope.currentUser = null;
        $scope.isAuthenticated = false;
    });

    // Initialize
    $scope.init = function() {
        if (AuthService.isAuthenticated()) {
            UserService.getCurrentUser().then(function(userData) {
                $scope.currentUser = userData;
            }).catch(function(error) {
                console.error('Error getting user data:', error);
            });
        }
    };

    // Call init
    $scope.init();
}]);
