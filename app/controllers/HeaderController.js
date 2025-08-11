// Header Controller - Handles navigation and user actions
angular.module('app').controller('HeaderController', ['$scope', '$location', 'AuthService',
function($scope, $location, AuthService) {
    const vm = this;

    // Navigation function
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    // Check if route is active
    vm.isActive = function(route) {
        return $location.path() === route;
    };

    // Check authentication status
    vm.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };

    // Get current user
    vm.getCurrentUser = function() {
        return AuthService.getCurrentUser();
    };

    // Logout function
    vm.logout = function() {
        AuthService.logout().then(function() {
            $location.path('/');
        }).catch(function(error) {
            console.error('Logout error:', error);
        });
    };

    // Mobile menu state
    vm.mobileMenuOpen = false;

    vm.toggleMobileMenu = function() {
        vm.mobileMenuOpen = !vm.mobileMenuOpen;
    };

    vm.closeMobileMenu = function() {
        vm.mobileMenuOpen = false;
    };

    // User dropdown state
    vm.userDropdownOpen = false;

    vm.toggleUserDropdown = function() {
        vm.userDropdownOpen = !vm.userDropdownOpen;
    };

    vm.closeUserDropdown = function() {
        vm.userDropdownOpen = false;
    };
}]);
