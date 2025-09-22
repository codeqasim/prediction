// User Service - Handles user data and operations (API Integration)
angular.module('app').service('UserService', ['$http', '$q', '$timeout', 'AuthService',
function($http, $q, $timeout, AuthService) {

    // Get current user profile from API
    this.getCurrentUser = function() {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser || !authUser.id) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        // Make API call to get user profile
        $http({
            method: 'GET',
            url: '/api/users/profile',
            headers: {
                'Authorization': 'Bearer ' + authUser.id,
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (response.data && response.data.status) {
                const user = response.data.data;
                // Add computed properties for compatibility
                user.username = user.email.split('@')[0];
                user.full_name = (user.first_name + ' ' + user.last_name).trim();
                user.predictions_total = user.stats ? user.stats.total_predictions : 0;
                user.predictions_correct = user.stats ? user.stats.correct_predictions : 0;
                user.accuracy = user.stats ? user.stats.accuracy : 0;
                
                // Ensure avatar_url has a fallback
                if (!user.avatar_url) {
                    user.avatar_url = 'https://ui-avatars.com/api/?name=' + 
                                    encodeURIComponent(user.full_name || user.username) + 
                                    '&background=8b45ff&color=fff';
                }
                
                deferred.resolve(user);
            } else {
                deferred.reject(new Error(response.data.message || 'Failed to fetch user profile'));
            }
        }).catch(function(error) {
            console.error('Error fetching user profile:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Update user profile data
    this.updateUser = function(userData) {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser || !authUser.id) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        $http({
            method: 'PUT',
            url: '/api/users/profile',
            headers: {
                'Authorization': 'Bearer ' + authUser.id,
                'Content-Type': 'application/json'
            },
            data: userData
        }).then(function(response) {
            if (response.data && response.data.status) {
                const user = response.data.data;
                // Add computed properties for compatibility
                user.username = user.email.split('@')[0];
                user.full_name = (user.first_name + ' ' + user.last_name).trim();
                
                deferred.resolve(user);
            } else {
                deferred.reject(new Error(response.data.message || 'Failed to update profile'));
            }
        }).catch(function(error) {
            console.error('Error updating user profile:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Upload user avatar
    this.uploadAvatar = function(file) {
        const deferred = $q.defer();

        const authUser = AuthService.getCurrentUser();
        if (!authUser || !authUser.id) {
            deferred.reject(new Error('No authenticated user'));
            return deferred.promise;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        $http({
            method: 'POST',
            url: '/api/users/avatar',
            headers: {
                'Authorization': 'Bearer ' + authUser.id,
                'Content-Type': undefined // Let browser set content-type for FormData
            },
            data: formData,
            transformRequest: angular.identity
        }).then(function(response) {
            if (response.data && response.data.status) {
                deferred.resolve(response.data.data);
            } else {
                deferred.reject(new Error(response.data.message || 'Failed to upload avatar'));
            }
        }).catch(function(error) {
            console.error('Error uploading avatar:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Add points (demo mode - would need API endpoint)
    this.addPoints = function(points) {
        const deferred = $q.defer();

        $timeout(function() {
            console.log('UserService: Add points (demo mode):', points);
            deferred.resolve({ success: true, points: points });
        }, 100);

        return deferred.promise;
    };

    // Get user statistics (now included in getCurrentUser response)
    this.getUserStats = function() {
        const deferred = $q.defer();
        
        // Use getCurrentUser which now includes stats
        this.getCurrentUser().then(function(user) {
            const stats = {
                total_predictions: user.stats ? user.stats.total_predictions : 0,
                correct_predictions: user.stats ? user.stats.correct_predictions : 0,
                accuracy: user.stats ? user.stats.accuracy : 0,
                points: user.points || 0,
                rank: user.stats && user.stats.accuracy > 80 ? 'Expert' : 
                      user.stats && user.stats.accuracy > 60 ? 'Advanced' : 
                      user.stats && user.stats.accuracy > 40 ? 'Intermediate' : 'Beginner'
            };
            
            deferred.resolve(stats);
        }).catch(function(error) {
            deferred.reject(error);
        });
        
        return deferred.promise;
    };

    // Get user predictions history (would need API endpoint)
    this.getUserPredictions = function(limit = 10) {
        const deferred = $q.defer();
        
        $timeout(function() {
            // For now, return empty array until predictions API is implemented
            const predictions = [];
            console.log('UserService: User predictions (not implemented):', predictions);
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

    // Create user profile (called after registration) - Not needed with current API design
    this.createProfile = function(userData) {
        const deferred = $q.defer();

        console.log('UserService: createProfile called (demo mode):', userData);
        
        // Profile is created during registration, just return success
        $timeout(function() {
            const authUser = AuthService.getCurrentUser();
            if (authUser) {
                deferred.resolve({
                    id: authUser.id,
                    email: authUser.email,
                    username: authUser.email.split('@')[0],
                    full_name: userData.firstName + ' ' + userData.lastName,
                    points: 100,
                    message: 'Profile created successfully'
                });
            } else {
                deferred.reject(new Error('No authenticated user'));
            }
        }, 100);

        return deferred.promise;
    };

    // Get all users (demo mode - would need API endpoint)
    this.getAllUsers = function() {
        const deferred = $q.defer();

        $timeout(function() {
            const authUser = AuthService.getCurrentUser();
            const users = [];

            if (authUser) {
                users.push({
                    id: authUser.id,
                    email: authUser.email,
                    created_at: new Date().toISOString(),
                    username: authUser.email.split('@')[0],
                    full_name: authUser.first_name + ' ' + authUser.last_name,
                    points: authUser.points || 0,
                    predictions_total: 0,
                    predictions_correct: 0,
                    accuracy: 0
                });
            }

            console.log('UserService: All users (demo mode):', users);
            deferred.resolve(users);
        }, 100);

        return deferred.promise;
    };
}]);
