// Header Controller - Handles navigation and user actions
angular.module('app').controller('HeaderController', ['$scope', '$location', 'AuthService',
function($scope, $location, AuthService) {
    const vm = this;
    
    console.log('HeaderController initialized');

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
        const isAuth = AuthService.isAuthenticated();
        console.log('Header checking auth:', isAuth);
        return isAuth;
    };

    // Get current user
    vm.getCurrentUser = function() {
        const user = AuthService.getCurrentUser();
        console.log('Header getting user:', user);
        return user;
    };
    
    // Get user display name
    vm.getUserDisplayName = function() {
        const user = vm.getCurrentUser();
        if (!user) return 'User';
        
        // Check for first and last name
        if (user.user_metadata && (user.user_metadata.first_name || user.user_metadata.last_name)) {
            const firstName = user.user_metadata.first_name || '';
            const lastName = user.user_metadata.last_name || '';
            return (firstName + ' ' + lastName).trim();
        }
        
        // Check for username
        if (user.user_metadata && user.user_metadata.username) {
            return user.user_metadata.username;
        }
        
        // Use email prefix
        if (user.email) {
            return user.email.split('@')[0];
        }
        
        return 'User';
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
    
    // Test function to check auth state
    vm.testAuth = function() {
        console.log('=== AUTH TEST ===');
        console.log('AuthService.isAuthenticated():', AuthService.isAuthenticated());
        console.log('AuthService.getCurrentUser():', AuthService.getCurrentUser());
        console.log('vm.isAuthenticated():', vm.isAuthenticated());
        console.log('vm.getCurrentUser():', vm.getCurrentUser());
        alert('Check console for auth state');
    };
    
    // Listen for auth state changes
    $scope.$on('auth:login', function(event, userData) {
        console.log('HeaderController received auth:login:', userData);
        // Force digest cycle
        $scope.$apply();
    });

    $scope.$on('auth:logout', function() {
        console.log('HeaderController received auth:logout');
        // Force digest cycle
        $scope.$apply();
    });
}]);
