// Header Controller - Handles navigation and user actions
angular.module('app').controller('HeaderController', ['$scope', '$location', 'AuthService', 'SupabaseService',
function($scope, $location, AuthService, SupabaseService) {
    const vm = this;

    console.log('HeaderController initialized');

    // Cache user data to prevent excessive calls
    vm.currentUser = null;
    vm.isAuth = false;
    vm.userPoints = 0; // Cache user points

    // Load user points from Supabase
    vm.loadUserPoints = function() {
        const user = vm.getCurrentUser();
        console.log('HeaderController: loadUserPoints - user object:', user);
        
        // Try different possible user ID fields
        let userId = null;
        if (user) {
            userId = user.id || user.user_id || (user.user && user.user.id);
        }
        
        if (!user || !userId) {
            console.log('HeaderController: No user or userId found:', { 
                user: !!user, 
                userId: userId,
                userKeys: user ? Object.keys(user) : 'no user'
            });
            vm.userPoints = 0;
            return;
        }

        console.log('HeaderController: Attempting to load points for user ID:', userId);

        try {
            const supabase = SupabaseService.getClient();
            if (supabase) {
                supabase
                    .from('profiles')
                    .select('total_points')
                    .eq('id', userId)
                    .single()
                    .then(function(response) {
                        console.log('HeaderController: Supabase response:', response);
                        if (response.data && response.data.total_points !== null) {
                            vm.userPoints = response.data.total_points;
                            console.log('HeaderController: Loaded user points:', vm.userPoints);
                        } else {
                            vm.userPoints = 0;
                            console.log('HeaderController: No points found in profiles table');
                        }
                        $scope.$apply(); // Trigger Angular digest cycle
                    })
                    .catch(function(error) {
                        console.error('HeaderController: Error loading user points:', error);
                        console.error('Error details:', error.message, error.details);
                        vm.userPoints = 0;
                        $scope.$apply();
                    });
            } else {
                console.log('HeaderController: Supabase client not available');
            }
        } catch (error) {
            console.error('HeaderController: Error accessing Supabase for points:', error);
            vm.userPoints = 0;
        }
    };

    // Get current user (cached)
    vm.getCurrentUser = function() {
        return vm.currentUser;
    };

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
            vm.loadUserPoints(); // Load points when user is found
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
        vm.userPoints = 0; // Reset points cache
        console.log('Header user data updated:', vm.currentUser ? 'logged in' : 'logged out');
        
        // Load fresh points if user is authenticated
        if (vm.isAuth && vm.currentUser) {
            vm.loadUserPoints();
        }
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

    // Navigate to user's public profile
    vm.navigateToUserProfile = function() {
        const user = vm.getCurrentUser();
        if (!user) {
            console.log('HeaderController: No user found for profile navigation');
            return;
        }

        // Get username from various possible sources
        let username = null;
        if (user.user_metadata && user.user_metadata.username) {
            username = user.user_metadata.username;
        } else if (user.email) {
            // Use email prefix as fallback username
            username = user.email.split('@')[0];
        }

        if (username) {
            console.log('HeaderController: Navigating to profile for username:', username);
            $location.path('/u/' + username);
        } else {
            console.log('HeaderController: No username found, cannot navigate to profile');
        }
    };

    // Refresh user points (can be called when points are updated)
    vm.refreshUserPoints = function() {
        vm.userPoints = 0; // Clear cache
        vm.loadUserPoints(); // Reload from database
    };

    // Get user points from cache (loads automatically when user data updates)
    vm.getUserPoints = function() {
        return vm.userPoints || 0;
    };

    // Logout function
    vm.logout = function() {
        console.log('HeaderController: Logout initiated');
        
        // Clear local cache immediately
        vm.currentUser = null;
        vm.isAuth = false;
        vm.userPoints = 0; // Clear points cache
        
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

    // Listen for points update events
    $scope.$on('user:points-updated', function(event) {
        console.log('HeaderController received user:points-updated');
        vm.refreshUserPoints(); // Refresh points from database
    });
}]);
