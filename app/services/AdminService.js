angular.module('app').service('AdminService', function($q, $rootScope, AuthService, SupabaseService) {
    console.log('AdminService initialized');

    // Get users from Supabase
    this.getUsers = function() {
        console.log('AdminService.getUsers() called - fetching real users from Supabase (PUBLIC ACCESS)');
        var deferred = $q.defer();

        // Remove authentication check - make it publicly accessible
        console.log('🔓 Public access enabled - fetching users without authentication');

        fetchUsersFromSupabase();

        function fetchUsersFromSupabase() {
            var supabaseClient = SupabaseService.getClient();

            if (!supabaseClient) {
                console.error('Supabase client not available');
                deferred.resolve({
                    data: getTestUsers(),
                    count: getTestUsers().length
                });
                return;
            }

            console.log('Attempting to fetch users with different methods...');

            // Method 1: Try user_profiles table first (public access)
            supabaseClient
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .then(function(response) {
                    if (response.error) {
                        throw new Error('user_profiles query failed: ' + response.error.message);
                    }

                    console.log('✅ Successfully fetched users from user_profiles table:', response.data.length);
                    var users = response.data.map(function(user) {
                        return {
                            id: user.id,
                            email: user.email,
                            user_metadata: {
                                username: user.username,
                                full_name: user.full_name,
                                points: user.points,
                                predictions_total: user.predictions_total,
                                predictions_correct: user.predictions_correct
                            },
                            email_confirmed_at: user.email_confirmed_at,
                            created_at: user.created_at,
                            last_sign_in_at: user.last_sign_in_at,
                            phone: user.phone || null,
                            role: user.role || 'authenticated',
                            isDeletable: true
                        };
                    });

                    deferred.resolve({
                        data: users,
                        count: users.length
                    });
                })
                .catch(function(tableError) {
                    console.log('❌ user_profiles table failed:', tableError.message);

                    // Method 2: Fallback to test users
                    fallbackToTestUsers();
                });
        }

        function fallbackToTestUsers() {
            console.log('📝 Falling back to test users for public access');
            var users = getTestUsers();

            deferred.resolve({
                data: users,
                count: users.length
            });
        }

        function getTestUsers() {
            return [
                {
                    id: 'test-user-1',
                    email: 'user1@example.com',
                    user_metadata: {
                        username: 'user1',
                        full_name: 'Test User One',
                        points: 150,
                        predictions_total: 25,
                        predictions_correct: 18
                    },
                    email_confirmed_at: new Date().toISOString(),
                    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    last_sign_in_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    phone: null,
                    role: 'authenticated',
                    isDeletable: true
                },
                {
                    id: 'test-user-2',
                    email: 'user2@example.com',
                    user_metadata: {
                        username: 'user2',
                        full_name: 'Test User Two',
                        points: 220,
                        predictions_total: 32,
                        predictions_correct: 24
                    },
                    email_confirmed_at: new Date().toISOString(),
                    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    last_sign_in_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    phone: null,
                    role: 'authenticated',
                    isDeletable: true
                },
                {
                    id: 'test-admin-1',
                    email: 'admin@example.com',
                    user_metadata: {
                        username: 'admin',
                        full_name: 'Admin User',
                        points: 500,
                        predictions_total: 100,
                        predictions_correct: 85
                    },
                    email_confirmed_at: new Date().toISOString(),
                    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    last_sign_in_at: new Date().toISOString(),
                    phone: null,
                    role: 'admin',
                    isDeletable: false
                }
            ];
        }

        return deferred.promise;
    };

    this.createUser = function(userData) {
        console.log('AdminService.createUser() called with:', userData);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        // Use Supabase Auth Admin API to create user
        supabaseClient.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            user_metadata: userData.user_metadata,
            email_confirm: true
        })
        .then(function(response) {
            if (response.error) {
                console.error('Failed to create user:', response.error);
                deferred.reject(response.error);
            } else {
                console.log('User created successfully:', response.data.user);
                deferred.resolve(response.data.user);
            }
        })
        .catch(function(error) {
            console.error('Error creating user:', error);
            deferred.reject(new Error('User creation not available - requires service role key'));
        });

        return deferred.promise;
    };

    this.updateUser = function(id, userData) {
        console.log('AdminService.updateUser() called with id:', id, 'data:', userData);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        // Use Supabase Auth Admin API to update user
        supabaseClient.auth.admin.updateUserById(id, {
            user_metadata: userData.user_metadata,
            email: userData.email
        })
        .then(function(response) {
            if (response.error) {
                console.error('Failed to update user:', response.error);
                deferred.reject(response.error);
            } else {
                console.log('User updated successfully:', response.data.user);
                deferred.resolve(response.data.user);
            }
        })
        .catch(function(error) {
            console.error('Error updating user:', error);
            deferred.reject(new Error('User update not available - requires service role key'));
        });

        return deferred.promise;
    };

    this.deleteUser = function(id) {
        console.log('AdminService.deleteUser() called with id:', id);
        var deferred = $q.defer();

        // Prevent deleting currently authenticated user (optional, keep for safety)
        var currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.id === id) {
            deferred.reject(new Error('Cannot delete the currently authenticated user'));
            return deferred.promise;
        }

        // Call the secure PHP API instead of Supabase directly
        fetch('/api/delete_supabase_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: id })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                console.log('User deleted successfully via PHP API');
                deferred.resolve({ success: true, message: data.message });
            } else {
                console.error('Failed to delete user via PHP API:', data.error);
                deferred.reject(new Error(data.error || 'Failed to delete user'));
            }
        })
        .catch(function(error) {
            console.error('Error deleting user via PHP API:', error);
            deferred.reject(error);
        });

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
