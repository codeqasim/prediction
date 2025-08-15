// Header Controller - Handles navigation and user actions
angular.module('app').controller('HeaderController', ['$scope', '$location', 'AuthService',
function($scope, $location, AuthService) {
    const vm = this;

    console.log('HeaderController initialized');

    // Cache user data to prevent excessive calls
    vm.currentUser = null;
    vm.isAuth = false;

    // Check localStorage directly using app.js functions
    vm.checkLocalStorage = function() {
        const storedUser = GET('currentUser');
        const isAuth = GET('isAuthenticated');
        
        console.log('HeaderController checking localStorage:');
        console.log('- Stored user:', storedUser);
        console.log('- Is authenticated:', isAuth);
        
        if (storedUser && isAuth) {
            vm.currentUser = storedUser;
            vm.isAuth = true;
            console.log('HeaderController: User found in localStorage!');
            return true;
        }
        
        vm.currentUser = null;
        vm.isAuth = false;
        console.log('HeaderController: No valid user in localStorage');
        return false;
    };

    // Update user data from AuthService
    vm.updateUserData = function() {
        vm.currentUser = AuthService.getCurrentUser();
        vm.isAuth = AuthService.isAuthenticated();
        console.log('Header user data updated:', vm.currentUser ? 'logged in' : 'logged out');
    };

    // Initialize user data - check localStorage first, then AuthService
    vm.initializeUser = function() {
        console.log('HeaderController: Initializing user data...');
        
        // First check localStorage directly
        if (!vm.checkLocalStorage()) {
            // If no localStorage data, check AuthService
            vm.updateUserData();
            
            // If AuthService also has no data, try to load from storage
            if (!vm.isAuth) {
                AuthService.checkLocalStorage();
                vm.updateUserData();
            }
        }
        
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

    // Check authentication status (cached)
    vm.isAuthenticated = function() {
        return vm.isAuth;
    };

    // Get current user (cached)
    vm.getCurrentUser = function() {
        return vm.currentUser;
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

        // Check for display name
        if (user.user_metadata && user.user_metadata.display_name) {
            return user.user_metadata.display_name;
        }

        // Use email prefix
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

    // Get user points with fallback
    vm.getUserPoints = function() {
        const user = vm.getCurrentUser();
        if (!user) return 0;

        // Check various possible locations for points
        return user.points || 
               (user.user_metadata && user.user_metadata.points) || 
               (user.app_metadata && user.app_metadata.points) || 
               0;
    };

    // Logout function
    vm.logout = function() {
        console.log('HeaderController: Logout initiated');
        
        // Clear local cache immediately
        vm.currentUser = null;
        vm.isAuth = false;
        
        // Clear localStorage directly
        DEL('currentUser');
        DEL('isAuthenticated');
        
        AuthService.logout().then(function() {
            console.log('HeaderController: Logout successful, redirecting to home');
            $location.path('/');
        }).catch(function(error) {
            console.error('Logout error:', error);
            // Even if logout fails, redirect to home since we cleared local data
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

    $scope.$on('auth:session-updated', function(event, userData) {
        console.log('HeaderController received auth:session-updated:', userData);
        vm.updateUserData(); // Refresh cached data
    });
}]);
