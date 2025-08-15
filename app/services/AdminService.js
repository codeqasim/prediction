angular.module('app').service('AdminService', function($q, $rootScope, SupabaseService) {
    console.log('AdminService initialized');

    // Get users from Supabase - REAL DATA ONLY
    this.getUsers = function() {
        console.log('AdminService.getUsers() called - fetching REAL users from Supabase');
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            console.error('Supabase client not available');
            deferred.resolve({
                data: [],
                count: 0
            });
            return deferred.promise;
        }

        console.log('Fetching users from profiles table...');

        // Get users from profiles table
        supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .then(function(response) {
                if (response.error) {
                    console.error('Error fetching users:', response.error.message);
                    deferred.resolve({
                        data: [],
                        count: 0
                    });
                    return;
                }

                console.log('✅ Successfully fetched users:', response.data.length);

                var users = response.data.map(function(user) {
                    return {
                        id: user.id,
                        email: user.email || 'No email',
                        user_metadata: {
                            username: user.username || 'No username',
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            full_name: (user.first_name || '') + ' ' + (user.last_name || ''),
                            points: user.points || 0,
                            predictions_total: user.predictions_total || 0,
                            predictions_correct: user.predictions_correct || 0
                        },
                        email_confirmed_at: user.email_confirmed_at,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
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
            .catch(function(error) {
                console.error('❌ Error fetching users:', error.message);
                deferred.resolve({
                    data: [],
                    count: 0
                });
            });

        return deferred.promise;
    };

    // Create new user
    this.createUser = function(userData) {
        console.log('AdminService.createUser() called with:', userData);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        // Insert into profiles table
        supabaseClient
            .from('profiles')
            .insert([{
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                points: userData.points || 0,
                predictions_total: userData.predictions_total || 0,
                predictions_correct: userData.predictions_correct || 0,
                role: userData.role || 'authenticated'
            }])
            .then(function(response) {
                if (response.error) {
                    console.error('Failed to create user:', response.error);
                    deferred.reject(response.error);
                } else {
                    console.log('User created successfully:', response.data);
                    deferred.resolve(response.data[0]);
                }
            })
            .catch(function(error) {
                console.error('Error creating user:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Update user
    this.updateUser = function(id, userData) {
        console.log('AdminService.updateUser() called with id:', id, 'data:', userData);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        // Update profiles table
        supabaseClient
            .from('profiles')
            .update({
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                points: userData.points,
                predictions_total: userData.predictions_total,
                predictions_correct: userData.predictions_correct,
                role: userData.role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .then(function(response) {
                if (response.error) {
                    console.error('Failed to update user:', response.error);
                    deferred.reject(response.error);
                } else {
                    console.log('User updated successfully:', response.data);
                    deferred.resolve(response.data[0]);
                }
            })
            .catch(function(error) {
                console.error('Error updating user:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Delete user
    this.deleteUser = function(id) {
        console.log('AdminService.deleteUser() called with id:', id);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        // Delete from profiles table
        supabaseClient
            .from('profiles')
            .delete()
            .eq('id', id)
            .then(function(response) {
                if (response.error) {
                    console.error('Failed to delete user:', response.error);
                    deferred.reject(response.error);
                } else {
                    console.log('✅ User deleted successfully');
                    deferred.resolve({ success: true, message: 'User deleted successfully' });
                }
            })
            .catch(function(error) {
                console.error('Error deleting user:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Get user by ID
    this.getUserById = function(id) {
        console.log('AdminService.getUserById() called with id:', id);
        var deferred = $q.defer();

        var supabaseClient = SupabaseService.getClient();

        if (!supabaseClient) {
            deferred.reject(new Error('Supabase client not available'));
            return deferred.promise;
        }

        supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()
            .then(function(response) {
                if (response.error) {
                    console.error('User not found:', response.error);
                    deferred.reject(new Error('User not found'));
                } else {
                    console.log('User found:', response.data);
                    deferred.resolve(response.data);
                }
            })
            .catch(function(error) {
                console.error('Error getting user:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Get user statistics
    this.getUserStats = function() {
        console.log('AdminService.getUserStats() called');
        var deferred = $q.defer();

        this.getUsers().then(function(result) {
            var users = result.data;
            var stats = {
                totalUsers: users.length,
                activeUsers: users.filter(function(user) {
                    return user.email_confirmed_at;
                }).length,
                totalPredictions: users.reduce(function(sum, user) {
                    return sum + (user.user_metadata.predictions_total || 0);
                }, 0),
                totalPoints: users.reduce(function(sum, user) {
                    return sum + (user.user_metadata.points || 0);
                }, 0)
            };

            console.log('User statistics:', stats);
            deferred.resolve(stats);
        }).catch(function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };
});