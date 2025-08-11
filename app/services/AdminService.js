angular.module('app').service('AdminService', function($q, $rootScope, AuthService) {
    console.log('AdminService initialized');
    
    // Demo users cache
    var demoUsers = [];
    var demoUsersInitialized = false;
    
    // Initialize demo users with current user + some mock users
    var initializeDemoUsers = function() {
        if (demoUsersInitialized) return;
        
        var currentUser = AuthService.getCurrentUser();
        if (!currentUser) return;
        
        demoUsers = [
            // Real current user (cannot be deleted)
            {
                id: currentUser.id,
                email: currentUser.email,
                user_metadata: currentUser.user_metadata || {},
                email_confirmed_at: currentUser.email_confirmed_at,
                created_at: currentUser.created_at,
                last_sign_in_at: currentUser.last_sign_in_at,
                phone: currentUser.phone || null,
                role: currentUser.role || 'authenticated',
                isDeletable: false
            },
            // Mock demo users (can be deleted)
            {
                id: 'demo-user-1',
                email: 'john.doe@example.com',
                user_metadata: { full_name: 'John Doe' },
                email_confirmed_at: '2024-01-15T10:30:00Z',
                created_at: '2024-01-15T10:30:00Z',
                last_sign_in_at: '2024-02-10T14:22:00Z',
                phone: '+1234567890',
                role: 'authenticated',
                isDeletable: true
            },
            {
                id: 'demo-user-2',
                email: 'jane.smith@example.com',
                user_metadata: { full_name: 'Jane Smith' },
                email_confirmed_at: '2024-02-20T08:15:00Z',
                created_at: '2024-02-20T08:15:00Z',
                last_sign_in_at: '2024-02-25T16:45:00Z',
                phone: '+1987654321',
                role: 'authenticated',
                isDeletable: true
            },
            {
                id: 'demo-user-3',
                email: 'mike.wilson@example.com',
                user_metadata: { full_name: 'Mike Wilson' },
                email_confirmed_at: null, // Pending user
                created_at: '2024-03-01T12:00:00Z',
                last_sign_in_at: null,
                phone: null,
                role: 'authenticated',
                isDeletable: true
            }
        ];
        
        demoUsersInitialized = true;
        console.log('Demo users initialized:', demoUsers.length);
    };
    
    this.getUsers = function() {
        console.log('AdminService.getUsers() called');
        var deferred = $q.defer();
        var resolved = false;
        
        // Function to get and format users
        var getUsersData = function() {
            if (resolved) return false; // Prevent duplicate resolution
            
            var currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                initializeDemoUsers();
                
                console.log('AdminService.getUsers() returning users:', demoUsers);
                resolved = true;
                deferred.resolve({
                    data: demoUsers,
                    count: demoUsers.length
                });
                return true;
            }
            return false;
        };
        
        // Try to get users immediately
        if (getUsersData()) {
            return deferred.promise;
        }
        
        // If no user found, wait for authentication
        console.log('No authenticated user found, waiting for authentication...');
        
        // Listen for auth:login event
        var authLoginListener = $rootScope.$on('auth:login', function(event, user) {
            console.log('AdminService received auth:login event');
            if (getUsersData()) {
                authLoginListener(); // Remove listener
            }
        });
        
        // Timeout fallback
        setTimeout(function() {
            if (!resolved && !getUsersData()) {
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
            // Find the user to delete
            var userIndex = -1;
            var userToDelete = null;
            
            for (var i = 0; i < demoUsers.length; i++) {
                if (demoUsers[i].id === id) {
                    userIndex = i;
                    userToDelete = demoUsers[i];
                    break;
                }
            }
            
            if (userToDelete) {
                if (!userToDelete.isDeletable) {
                    console.log('AdminService.deleteUser() - Cannot delete currently authenticated user');
                    deferred.reject(new Error('Cannot delete the currently authenticated user. This would break the demo session.'));
                } else {
                    // Remove user from demo users array
                    demoUsers.splice(userIndex, 1);
                    console.log('AdminService.deleteUser() - Demo user deleted successfully:', userToDelete.email);
                    deferred.resolve({ success: true, message: 'User deleted successfully' });
                }
            } else {
                console.log('AdminService.deleteUser() - User not found:', id);
                deferred.reject(new Error('User not found'));
            }
        }, 500); // Simulate API delay
        
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
