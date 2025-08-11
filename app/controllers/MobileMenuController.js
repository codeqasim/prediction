angular.module('app').controller('MobileMenuController', ['$scope', '$timeout', '$location', 'AuthService', function($scope, $timeout, $location, AuthService) {
    const vm = this;

    // Initialize mobile menu state
    vm.isOpen = false;

    // Toggle mobile menu
    vm.toggle = function() {
        vm.isOpen = !vm.isOpen;
    };

    // Close mobile menu
    vm.close = function() {
        vm.isOpen = false;
    };

    // Navigation function
    vm.navigateTo = function(path) {
        $location.path(path);
        vm.close();
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
            vm.close();
        }).catch(function(error) {
            console.error('Logout error:', error);
        });
    };

    // Handle click outside to close menu
    vm.handleOutsideClick = function(event) {
        $timeout(function() {
            if (!event.target.closest('.mobile-menu')) {
                vm.isOpen = false;
            }
        });
    };

    // Bind outside click handler
    document.addEventListener('click', vm.handleOutsideClick);

    // Cleanup on destroy
    $scope.$on('$destroy', function() {
        document.removeEventListener('click', vm.handleOutsideClick);
    });
}]);
