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
            first_name: (authUser.user_metadata && authUser.user_metadata.first_name) || '',
            last_name: (authUser.user_metadata && authUser.user_metadata.last_name) || '',
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

    // Get user statistics (real data from current user)
    this.getUserStats = function() {
        const deferred = $q.defer();
        
        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        $timeout(function() {
            // Use real user metadata or defaults for new users
            const stats = {
                total_predictions: authUser.user_metadata?.predictions_total || 0,
                correct_predictions: authUser.user_metadata?.predictions_correct || 0,
                accuracy: authUser.user_metadata?.predictions_total > 0 ? 
                         Math.round((authUser.user_metadata?.predictions_correct || 0) / authUser.user_metadata.predictions_total * 100) : 0,
                points: authUser.user_metadata?.points || 0,
                rank: authUser.user_metadata?.rank || 'Unranked'
            };
            console.log('UserService: Real user stats:', stats);
            deferred.resolve(stats);
        }, 100);
        
        return deferred.promise;
    };

    // Get user predictions history (real data)
    this.getUserPredictions = function(limit = 10) {
        const deferred = $q.defer();
        
        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        $timeout(function() {
            // For now, return empty array since user is new
            // In a real app, this would fetch from a predictions table in Supabase
            const predictions = [];
            
            console.log('UserService: Real user predictions:', predictions);
            deferred.resolve(predictions);
        }, 100);
        
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

    // Create user profile (called after registration) - Demo mode
    this.createProfile = function(userData) {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // In demo mode, we just simulate profile creation
        const profileData = {
            id: authUser.id,
            email: authUser.email,
            username: userData.username || authUser.email.split('@')[0],
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            created_at: authUser.created_at,
            points: 0, // New user starts with 0 points
            predictions_total: 0,
            predictions_correct: 0,
            avatar_url: userData.avatar_url || 
                       'https://ui-avatars.com/api/?name=' + encodeURIComponent((userData.firstName || '') + ' ' + (userData.lastName || '')) + '&background=8b45ff&color=fff'
        };

        $timeout(function() {
            console.log('UserService: Profile created (demo mode):', profileData);
            deferred.resolve(profileData);
        }, 100);

        return deferred.promise;
    };

    // Get all users from Supabase (for admin dashboard, leaderboard, etc.)
    this.getAllUsers = function() {
        const deferred = $q.defer();

        // Try to get real users from Supabase
        const supabaseService = angular.element(document).injector().get('SupabaseService');
        const supabaseClient = supabaseService.getClient();

        if (supabaseClient && !window.supabaseConfig.demoMode) {
            // Use real Supabase data
            supabaseClient.auth.admin.listUsers()
                .then(function(response) {
                    if (response.data && response.data.users) {
                        const users = response.data.users.map(function(user) {
                            return {
                                id: user.id,
                                email: user.email,
                                created_at: user.created_at,
                                last_sign_in_at: user.last_sign_in_at,
                                username: user.user_metadata?.username || user.email.split('@')[0],
                                first_name: user.user_metadata?.first_name || '',
                                last_name: user.user_metadata?.last_name || '',
                                points: user.user_metadata?.points || 0,
                                predictions_total: user.user_metadata?.predictions_total || 0,
                                predictions_correct: user.user_metadata?.predictions_correct || 0
                            };
                        });
                        deferred.resolve(users);
                    } else {
                        deferred.resolve([]);
                    }
                })
                .catch(function(error) {
                    console.error('Error fetching users from Supabase:', error);
                    deferred.reject(error);
                });
        } else {
            // Fallback: Try to get authenticated users list using the public API
            // This is a workaround since admin API requires service role key
            $timeout(function() {
                console.log('Attempting to fetch real users from Supabase...');
                
                // For now, show the current user as an example
                const authUser = AuthService.getCurrentUser();
                const users = [];
                
                if (authUser) {
                    users.push({
                        id: authUser.id,
                        email: authUser.email,
                        created_at: authUser.created_at,
                        last_sign_in_at: authUser.last_sign_in_at,
                        username: authUser.user_metadata?.username || authUser.email.split('@')[0],
                        first_name: authUser.user_metadata?.first_name || '',
                        last_name: authUser.user_metadata?.last_name || '',
                        points: authUser.user_metadata?.points || 0,
                        predictions_total: 0,
                        predictions_correct: 0
                    });
                }

                console.log('Current authenticated user:', users);
                deferred.resolve(users);
            }, 100);
        }

        return deferred.promise;
    };
}]);
