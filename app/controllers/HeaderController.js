// Header Controller - Handles navigation and user actions
angular.module('app').controller('HeaderController', ['$scope', '$location', 'AuthService',
function($scope, $location, AuthService) {
    const vm = this;

    console.log('HeaderController initialized');

    // Cache user data to prevent excessive calls
    vm.currentUser = null;
    vm.isAuth = false;
    vm.userPoints = 0; // Cache user points

    // Get current user from AuthService
    vm.getCurrentUser = function() {
        return AuthService.getCurrentUser();
    };

    // Check authentication status
    vm.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };

    // Update user data from AuthService
    vm.updateUserData = function() {
        vm.currentUser = AuthService.getCurrentUser();
        vm.isAuth = AuthService.isAuthenticated();
        
        // Set user points from our API data
        if (vm.currentUser && vm.currentUser.points) {
            vm.userPoints = vm.currentUser.points;
        } else {
            vm.userPoints = 0;
        }
        
        console.log('Header user data updated:', vm.currentUser ? 'logged in' : 'logged out');
    };

    // Initialize user data
    vm.initializeUser = function() {
        console.log('HeaderController: Initializing user data...');
        vm.updateUserData();
        console.log('HeaderController: Initialization complete. User:', vm.currentUser ? 'Found' : 'Not found');
    };

    // Initialize on controller load
    vm.initializeUser();

    // Navigation function
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    // Check if route is active
    vm.isActive = function(route) {
        return $location.path() === route;
    };

    // Get user display name
    vm.getUserDisplayName = function() {
        const user = vm.getCurrentUser();
        if (!user) return 'User';

        // Check for first and last name from our API
        if (user.first_name || user.last_name) {
            const firstName = user.first_name || '';
            const lastName = user.last_name || '';
            return (firstName + ' ' + lastName).trim();
        }

        // Use email prefix as fallback
        if (user.email) {
            return user.email.split('@')[0];
        }

        return 'User';
    };

    // Get user email
    vm.getUserEmail = function() {
        const user = vm.getCurrentUser();
        return user ? user.email || 'No email' : 'No email';
    };

    // Navigate to user's public profile
    vm.navigateToUserProfile = function() {
        const user = vm.getCurrentUser();
        if (!user) {
            console.log('HeaderController: No user found for profile navigation');
            return;
        }

        // Use email prefix as username
        let username = null;
        if (user.email) {
            username = user.email.split('@')[0];
        }

        if (username) {
            console.log('HeaderController: Navigating to profile for username:', username);
            $location.path('/u/' + username);
        } else {
            console.log('HeaderController: No username found, cannot navigate to profile');
        }
    };

    // Get user points from our API data
    vm.getUserPoints = function() {
        const user = vm.getCurrentUser();
        return user && user.points ? user.points : 0;
    };

    // Logout function
    vm.logout = function() {
        console.log('HeaderController: Logout initiated');

        AuthService.logout().then(function() {
            console.log('HeaderController: Logout successful, redirecting to home');
            vm.updateUserData(); // Update cached data
            $location.path('/');
        }).catch(function(error) {
            console.error('Logout error:', error);
            // Even if logout fails, redirect to home since we cleared local data
            vm.updateUserData();
            $location.path('/');
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

    // Listen for auth state changes
    $scope.$on('auth:login', function(event, userData) {
        console.log('HeaderController received auth:login:', userData);
        vm.updateUserData(); // Refresh cached data
    });

    $scope.$on('auth:logout', function(event) {
        console.log('HeaderController received auth:logout');
        vm.updateUserData(); // Refresh cached data
    });
}]);
