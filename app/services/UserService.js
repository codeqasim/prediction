// User Service - Handles user data and operations (Demo Mode)
angular.module('app').service('UserService', ['$q', '$timeout', 'AuthService',
function($q, $timeout, AuthService) {

    // Get current user data from auth (no database dependency)
    this.getCurrentUser = function() {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Create user profile from auth data only
        const userProfile = {
            id: authUser.id,
            email: authUser.email,
            username: authUser.email.split('@')[0],
            full_name: (authUser.user_metadata && authUser.user_metadata.full_name) || '',
            created_at: authUser.created_at,
            points: 1250, // Default points
            predictions_total: 15,
            predictions_correct: 12,
            avatar_url: (authUser.user_metadata && authUser.user_metadata.avatar_url) ||
                       'https://ui-avatars.com/api/?name=' + encodeURIComponent(authUser.email.split('@')[0]) + '&background=8b45ff&color=fff'
        };

        $timeout(function() {
            deferred.resolve(userProfile);
        }, 50);

        return deferred.promise;
    };

    // Update user data (demo mode - just returns success)
    this.updateUser = function(userData) {
        const deferred = $q.defer();

        $timeout(function() {
            console.log('UserService: Update user (demo mode):', userData);
            deferred.resolve(userData);
        }, 100);

        return deferred.promise;
    };

    // Add points (demo mode)
    this.addPoints = function(points) {
        const deferred = $q.defer();

        $timeout(function() {
            console.log('UserService: Add points (demo mode):', points);
            deferred.resolve({ success: true, points: points });
        }, 100);

        return deferred.promise;
    };

    // Get user statistics (real data from Supabase profiles table)
    this.getUserStats = function() {
        const deferred = $q.defer();
        
        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Try to get real stats from Supabase profiles table
        const supabaseService = angular.element(document).injector().get('SupabaseService');
        const supabaseClient = supabaseService.getClient();

        if (supabaseClient) {
            supabaseClient
                .from('profiles')
                .select('points, predictions_total, predictions_correct, rank')
                .eq('id', authUser.id)
                .single()
                .then(function(response) {
                    if (response.error) {
                        console.error('Error fetching user stats from profiles:', response.error);
                        // Fallback to default stats for new users
                        fallbackToDefaults();
                        return;
                    }
                    
                    const userProfile = response.data;
                    const stats = {
                        total_predictions: userProfile.predictions_total || 0,
                        correct_predictions: userProfile.predictions_correct || 0,
                        accuracy: userProfile.predictions_total > 0 ? 
                                 Math.round((userProfile.predictions_correct / userProfile.predictions_total) * 100) : 0,
                        points: userProfile.points || 0,
                        rank: userProfile.rank || 'Beginner'
                    };
                    
                    console.log('✅ UserService: Real user stats from database:', stats);
                    deferred.resolve(stats);
                })
                .catch(function(error) {
                    console.error('Error fetching user stats:', error);
                    fallbackToDefaults();
                });
        } else {
            fallbackToDefaults();
        }

        function fallbackToDefaults() {
            $timeout(function() {
                // Default stats for new users
                const stats = {
                    total_predictions: 0,
                    correct_predictions: 0,
                    accuracy: 0,
                    points: 100, // Give new users 100 starting points
                    rank: 'Beginner'
                };
                console.log('UserService: Fallback default stats:', stats);
                deferred.resolve(stats);
            }, 100);
        }
        
        return deferred.promise;
    };

    // Get user predictions history (real data from Supabase)
    this.getUserPredictions = function(limit = 10) {
        const deferred = $q.defer();
        
        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Try to get real predictions from Supabase predictions table
        const supabaseService = angular.element(document).injector().get('SupabaseService');
        const supabaseClient = supabaseService.getClient();

        if (supabaseClient) {
            supabaseClient
                .from('predictions')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })
                .limit(limit)
                .then(function(response) {
                    if (response.error) {
                        console.error('Error fetching user predictions:', response.error);
                        // Fallback to empty array
                        fallbackToEmpty();
                        return;
                    }
                    
                    const predictions = response.data || [];
                    console.log('✅ UserService: Real user predictions from database:', predictions);
                    deferred.resolve(predictions);
                })
                .catch(function(error) {
                    console.error('Error fetching user predictions:', error);
                    fallbackToEmpty();
                });
        } else {
            fallbackToEmpty();
        }

        function fallbackToEmpty() {
            $timeout(function() {
                // For new users or when database is not available
                const predictions = [];
                console.log('UserService: Fallback empty predictions:', predictions);
                deferred.resolve(predictions);
            }, 100);
        }
        
        return deferred.promise;
    };

    // Get leaderboard (demo mode)
    this.getLeaderboard = function(limit = 10) {
        const deferred = $q.defer();

        $timeout(function() {
            const leaderboard = [
                {
                    rank: 1,
                    username: 'predict_master',
                    points: 2450,
                    accuracy: 92
                },
                {
                    rank: 2,
                    username: 'sports_guru',
                    points: 2100,
                    accuracy: 88
                },
                {
                    rank: 3,
                    username: (AuthService.getCurrentUser() && AuthService.getCurrentUser().email) ?
                            AuthService.getCurrentUser().email.split('@')[0] : 'you',
                    points: 1250,
                    accuracy: 80
                }
            ];
            deferred.resolve(leaderboard);
        }, 100);

        return deferred.promise;
    };

    // Create user profile (called after registration) - Real Supabase integration with fallback
    this.createProfile = function(userData) {
        const deferred = $q.defer();

        console.log('🔄 CreateProfile called with userData:', userData);

        const authUser = AuthService.getCurrentUser();
        console.log('🔍 Current auth user:', authUser);

        if (!authUser) {
            console.error('❌ No authenticated user found during profile creation');
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Create profile in Supabase profiles table
        const supabaseService = angular.element(document).injector().get('SupabaseService');
        const supabaseClient = supabaseService.getClient();

        console.log('🔍 Supabase client:', supabaseClient);
        console.log('🔍 Supabase available:', supabaseService.isAvailable());

        if (!supabaseClient) {
            console.warn('⚠️ Supabase client not available, using demo mode fallback');
            return createDemoProfile();
        }

        // Test basic connection first
        console.log('🧪 Testing Supabase connection...');
        supabaseClient
            .from('profiles')
            .select('count', { count: 'exact' })
            .then(function(testResponse) {
                console.log('🧪 Connection test result:', testResponse);
                
                if (testResponse.error) {
                    console.error('❌ Connection test failed:', testResponse.error);
                    console.warn('⚠️ Falling back to demo mode due to connection failure');
                    return createDemoProfile();
                }
                
                console.log('✅ Connection test passed, proceeding with profile creation');
                
                // Now proceed with actual profile creation
                const profileData = {
                    id: authUser.id,
                    email: authUser.email,
                    username: userData.username || authUser.email.split('@')[0],
                    full_name: ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim(),
                    email_confirmed_at: authUser.email_confirmed_at,
                    last_sign_in_at: authUser.last_sign_in_at,
                    created_at: authUser.created_at,
                    points: 100, // New user starts with 100 points
                    predictions_total: 0,
                    predictions_correct: 0,
                    rank: 'Beginner',
                    avatar_url: userData.avatar_url || 
                               'https://ui-avatars.com/api/?name=' + encodeURIComponent((userData.firstName || '') + ' ' + (userData.lastName || '')) + '&background=8b45ff&color=fff'
                };

                console.log('📝 Attempting to create profile in database:', profileData);

                return supabaseClient
                    .from('profiles')
                    .upsert(profileData)
                    .select();
            })
            .then(function(response) {
                if (response && response.then) {
                    // This is a promise (from demo fallback)
                    return response;
                }
                
                console.log('📊 Database response:', response);
                
                if (response.error) {
                    console.error('❌ Database error response:', response.error);
                    console.warn('⚠️ Falling back to demo mode due to database error');
                    return createDemoProfile();
                }
                
                if (!response.data || response.data.length === 0) {
                    console.error('❌ No data returned from database insert');
                    console.warn('⚠️ Falling back to demo mode due to empty response');
                    return createDemoProfile();
                }
                
                console.log('✅ UserService: Profile created successfully in database:', response.data[0]);
                deferred.resolve(response.data[0]);
            })
            .catch(function(error) {
                console.error('❌ Error during profile creation (catch block):', error);
                console.warn('⚠️ Falling back to demo mode due to error');
                createDemoProfile().then(function(profile) {
                    deferred.resolve(profile);
                }).catch(function(demoError) {
                    deferred.reject(demoError);
                });
            });

        // Demo mode fallback function
        function createDemoProfile() {
            return new Promise(function(resolve) {
                $timeout(function() {
                    const profileData = {
                        id: authUser.id,
                        email: authUser.email,
                        username: userData.username || authUser.email.split('@')[0],
                        full_name: ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim(),
                        created_at: authUser.created_at,
                        points: 100, // New user starts with 100 points
                        predictions_total: 0,
                        predictions_correct: 0,
                        rank: 'Beginner',
                        avatar_url: userData.avatar_url || 
                                   'https://ui-avatars.com/api/?name=' + encodeURIComponent((userData.firstName || '') + ' ' + (userData.lastName || '')) + '&background=8b45ff&color=fff'
                    };

                    console.log('✅ UserService: Profile created (demo mode):', profileData);
                    resolve(profileData);
                }, 100);
            });
        }

        return deferred.promise;
    };

    // Get all users from Supabase (for admin dashboard, leaderboard, etc.)
    this.getAllUsers = function() {
        const deferred = $q.defer();

        // Try to get real users from Supabase profiles table
        const supabaseService = angular.element(document).injector().get('SupabaseService');
        const supabaseClient = supabaseService.getClient();

        if (supabaseClient) {
            // Use the profiles table for better data access
            supabaseClient
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .then(function(response) {
                    if (response.error) {
                        console.error('Error fetching users from profiles:', response.error);
                        // Fallback to current user
                        fallbackToCurrentUser();
                        return;
                    }

                    console.log('✅ Successfully fetched users from profiles table:', response.data.length);
                    const users = response.data.map(function(user) {
                        return {
                            id: user.id,
                            email: user.email,
                            created_at: user.created_at,
                            last_sign_in_at: user.last_sign_in_at,
                            username: user.username || user.email.split('@')[0],
                            full_name: user.full_name || '',
                            email_confirmed_at: user.email_confirmed_at,
                            points: user.points || 0,
                            predictions_total: user.predictions_total || 0,
                            predictions_correct: user.predictions_correct || 0,
                            accuracy: user.predictions_total > 0 ?
                                     Math.round((user.predictions_correct / user.predictions_total) * 100) : 0
                        };
                    });
                    deferred.resolve(users);
                })
                .catch(function(error) {
                    console.error('Error fetching users from profiles table:', error);
                    fallbackToCurrentUser();
                });
        } else {
            fallbackToCurrentUser();
        }

        function fallbackToCurrentUser() {
            // Fallback: Show current user only
            $timeout(function() {
                const authUser = AuthService.getCurrentUser();
                const users = [];

                if (authUser) {
                    users.push({
                        id: authUser.id,
                        email: authUser.email,
                        created_at: authUser.created_at,
                        last_sign_in_at: authUser.last_sign_in_at,
                        username: authUser.user_metadata?.username || authUser.email.split('@')[0],
                        full_name: authUser.user_metadata?.full_name || '',
                        email_confirmed_at: authUser.email_confirmed_at,
                        points: authUser.user_metadata?.points || 0,
                        predictions_total: 0,
                        predictions_correct: 0,
                        accuracy: 0
                    });
                }

                console.log('Fallback: Current authenticated user:', users);
                deferred.resolve(users);
            }, 100);
        }

        return deferred.promise;
    };
}]);
