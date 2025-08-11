// User Service - Handles user data and operations
angular.module('app').service('UserService', ['$q', '$timeout', 'SupabaseService', 'AuthService',
function($q, $timeout, SupabaseService, AuthService) {
    // Get current user data from database
    this.getCurrentUser = function() {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Get user profile data from database
        SupabaseService.db.select('users', '*')
            .eq('id', authUser.id)
            .single()
            .then(function(response) {
                if (response.error) {
                    console.error('Error fetching user data:', response.error);

                    // If table doesn't exist, create user profile from auth data
                    if (response.error.code === '42P01') {
                        const userProfile = {
                            id: authUser.id,
                            email: authUser.email,
                            username: authUser.email.split('@')[0],
                            first_name: authUser.user_metadata?.first_name || '',
                            last_name: authUser.user_metadata?.last_name || '',
                            created_at: authUser.created_at,
                            points: 0,
                            predictions_made: 0,
                            predictions_correct: 0
                        };
                        deferred.resolve(userProfile);
                    } else {
                        deferred.reject(response.error);
                    }
                } else {
                    deferred.resolve(response.data);
                }
            }).catch(function(error) {
                console.error('Error fetching user data:', error);

                // If table doesn't exist, create user profile from auth data
                if (error.code === '42P01') {
                    const userProfile = {
                        id: authUser.id,
                        email: authUser.email,
                        username: authUser.email.split('@')[0],
                        first_name: authUser.user_metadata?.first_name || '',
                        last_name: authUser.user_metadata?.last_name || '',
                        created_at: authUser.created_at,
                        points: 0,
                        predictions_made: 0,
                        predictions_correct: 0
                    };
                    deferred.resolve(userProfile);
                } else {
                    deferred.reject(error);
                }
            });

        return deferred.promise;
    };

    // Update user profile
    this.updateProfile = function(userData) {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        SupabaseService.db.update('users', userData)
            .eq('id', authUser.id)
            .then(function(response) {
                if (response.error) {
                    deferred.reject(response.error);
                } else {
                    deferred.resolve(response.data);
                }
            }).catch(function(error) {
                console.error('Error updating profile:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Get user statistics
    this.getUserStats = function(userId) {
        const deferred = $q.defer();

        // Use current user if no userId provided
        if (!userId) {
            const authUser = AuthService.getCurrentUser();
            if (!authUser) {
                deferred.reject(new Error('No authenticated user'));
                return deferred.promise;
            }
            userId = authUser.id;
        }

        // Get user stats (this would depend on your database schema)
        SupabaseService.db.select('user_stats', '*')
            .eq('user_id', userId)
            .single()
            .then(function(response) {
                if (response.error) {
                    // If no stats found, return default stats
                    if (response.error.code === 'PGRST116') {
                        deferred.resolve({
                            total_predictions: 0,
                            correct_predictions: 0,
                            accuracy: 0,
                            points: 100, // Default starting points
                            rank: null
                        });
                    } else {
                        deferred.reject(response.error);
                    }
                } else {
                    deferred.resolve(response.data);
                }
            }).catch(function(error) {
                console.error('Error fetching user stats:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Create user profile (called after registration)
    this.createProfile = function(userData) {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        const profileData = {
            id: authUser.id,
            email: authUser.email,
            username: userData.username || null,
            first_name: userData.firstName || null,
            last_name: userData.lastName || null,
            avatar_url: null,
            points: 100, // Starting points
            created_at: new Date().toISOString()
        };

        SupabaseService.db.insert('users', profileData)
            .then(function(response) {
                if (response.error) {
                    deferred.reject(response.error);
                } else {
                    deferred.resolve(response.data);
                }
            }).catch(function(error) {
                console.error('Error creating profile:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Check if username is available
    this.checkUsername = function(username) {
        const deferred = $q.defer();

        SupabaseService.db.select('users', 'username')
            .eq('username', username)
            .then(function(response) {
                if (response.error) {
                    deferred.reject(response.error);
                } else {
                    // Username is available if no results found
                    deferred.resolve(response.data.length === 0);
                }
            }).catch(function(error) {
                console.error('Error checking username:', error);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Get leaderboard data
    this.getLeaderboard = function(limit = 10) {
        const deferred = $q.defer();

        // Use demo data instead of Supabase for now
        $timeout(function() {
            const sampleLeaderboard = [
                {
                    id: 1,
                    username: "PredictionMaster",
                    first_name: "John",
                    last_name: "Doe",
                    points: 2580,
                    rank: 1,
                    total_predictions: 156,
                    accuracy_percentage: 86
                },
                {
                    id: 2,
                    username: "FutureSeeker",
                    first_name: "Jane",
                    last_name: "Smith",
                    points: 2340,
                    rank: 2,
                    total_predictions: 142,
                    accuracy_percentage: 83
                },
                {
                    id: 3,
                    username: "CrystalBall",
                    first_name: "Mike",
                    last_name: "Johnson",
                    points: 2180,
                    rank: 3,
                    total_predictions: 128,
                    accuracy_percentage: 82
                },
                {
                    id: 4,
                    username: "TrendSpotter",
                    first_name: "Sarah",
                    last_name: "Wilson",
                    points: 1960,
                    rank: 4,
                    total_predictions: 98,
                    accuracy_percentage: 81
                },
                {
                    id: 5,
                    username: "DataDriven",
                    first_name: "Alex",
                    last_name: "Brown",
                    points: 1740,
                    rank: 5,
                    total_predictions: 87,
                    accuracy_percentage: 79
                }
            ];

            const limitedResults = sampleLeaderboard.slice(0, limit);
            deferred.resolve(limitedResults);
        }, 300);

        return deferred.promise;
    };
}]);
