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

    // Get user statistics (demo mode)
    this.getUserStats = function() {
        const deferred = $q.defer();
        
        $timeout(function() {
            const stats = {
                total_predictions: 15,
                correct_predictions: 12,
                accuracy: 80,
                points: 1250,
                rank: 'Gold'
            };
            deferred.resolve(stats);
        }, 100);
        
        return deferred.promise;
    };

    // Get user predictions history (demo mode)
    this.getUserPredictions = function(limit = 10) {
        const deferred = $q.defer();
        
        $timeout(function() {
            const predictions = [
                {
                    id: 1,
                    match: 'Team A vs Team B',
                    prediction: 'Team A',
                    actual_result: 'Team A',
                    correct: true,
                    points_earned: 100,
                    date: '2024-02-15'
                },
                {
                    id: 2,
                    match: 'Team C vs Team D',
                    prediction: 'Team C',
                    actual_result: 'Team D',
                    correct: false,
                    points_earned: 0,
                    date: '2024-02-14'
                }
            ];
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
}]);
