angular.module('app').service('AdminService', function($q, $rootScope, AuthService) {
    console.log('AdminService initialized');
    
    this.getUsers = function() {
        console.log('AdminService.getUsers() called');
        var deferred = $q.defer();
        var resolved = false;
        
        // Function to get and format current user
        var getCurrentUserData = function() {
            if (resolved) return false; // Prevent duplicate resolution
            
            var currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                var users = [{
                    id: currentUser.id,
                    email: currentUser.email,
                    user_metadata: currentUser.user_metadata || {},
                    email_confirmed_at: currentUser.email_confirmed_at,
                    created_at: currentUser.created_at,
                    last_sign_in_at: currentUser.last_sign_in_at,
                    phone: currentUser.phone || null,
                    role: currentUser.role || 'authenticated'
                }];
                
                console.log('AdminService.getUsers() returning current user:', users);
                resolved = true;
                deferred.resolve({
                    data: users,
                    count: users.length
                });
                return true;
            }
            return false;
        };
        
        // Try to get current user immediately
        if (getCurrentUserData()) {
            return deferred.promise;
        }
        
        // If no user found, wait for authentication
        console.log('No authenticated user found, waiting for authentication...');
        
        // Listen for auth:login event
        var authLoginListener = $rootScope.$on('auth:login', function(event, user) {
            console.log('AdminService received auth:login event');
            if (getCurrentUserData()) {
                authLoginListener(); // Remove listener
            }
        });
        
        // Timeout fallback
        setTimeout(function() {
            if (!resolved && !getCurrentUserData()) {
                console.error('AdminService timeout: No authenticated user found after waiting');
                authLoginListener(); // Remove listener
                resolved = true;
                deferred.reject(new Error('No authenticated user found after timeout'));
            }
        }, 3000);
        
        return deferred.promise;
    };

    this.createUser = function(userData) {
        console.log('AdminService.createUser() called with:', userData);
        var deferred = $q.defer();
        
        setTimeout(function() {
            console.log('AdminService.createUser() - Feature not available in demo mode');
            deferred.reject(new Error('User creation not available in demo mode'));
        }, 100);
        
        return deferred.promise;
    };

    this.updateUser = function(id, userData) {
        console.log('AdminService.updateUser() called with id:', id, 'data:', userData);
        var deferred = $q.defer();
        
        setTimeout(function() {
            console.log('AdminService.updateUser() - Feature not available in demo mode');
            deferred.reject(new Error('User update not available in demo mode'));
        }, 100);
        
        return deferred.promise;
    };

    this.deleteUser = function(id) {
        console.log('AdminService.deleteUser() called with id:', id);
        var deferred = $q.defer();
        
        setTimeout(function() {
            console.log('AdminService.deleteUser() - Feature not available in demo mode');
            deferred.reject(new Error('User deletion not available in demo mode'));
        }, 100);
        
        return deferred.promise;
    };

    this.getUserById = function(id) {
        console.log('AdminService.getUserById() called with id:', id);
        var deferred = $q.defer();
        
        var currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id === id) {
            setTimeout(function() {
                deferred.resolve(currentUser);
            }, 100);
        } else {
            setTimeout(function() {
                deferred.reject(new Error('User not found'));
            }, 100);
        }
        
        return deferred.promise;
    };
});
