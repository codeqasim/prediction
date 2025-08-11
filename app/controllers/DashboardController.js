// Dashboard Controller - Handles user dashboard functionality
angular.module('app').controller('DashboardController', ['$scope', '$location', '$timeout', 'UserService', 'AuthService',
function($scope, $location, $timeout, UserService, AuthService) {
    console.log('📊 Dashboard Controller Initialized');

    const vm = this;

    // User data
    vm.currentUser = null;
    vm.userStats = {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        currentRank: 0,
        points: 0
    };
    vm.recentPredictions = [];
    vm.isLoading = true;

    // Load dashboard data
    vm.loadDashboard = function() {
        vm.isLoading = true;

        // Get current user
        const authUser = AuthService.getCurrentUser();
        if (!authUser) {
            $location.path('/auth');
            return;
        }

        vm.currentUser = authUser;

        // Load real user data from Supabase instead of demo data
        vm.loadRealUserData();
    };

    // Load real user data from Supabase
    vm.loadRealUserData = function() {
        // Get user statistics from UserService (which should fetch from Supabase)
        UserService.getUserStats().then(function(stats) {
            vm.userStats = {
                totalPredictions: stats.total_predictions || 0,
                correctPredictions: stats.correct_predictions || 0,
                accuracy: stats.accuracy || 0,
                currentRank: stats.rank || 'Unranked',
                points: stats.points || 0
            };
        }).catch(function(error) {
            console.error('Error loading user stats:', error);
            // Use default values if error
            vm.userStats = {
                totalPredictions: 0,
                correctPredictions: 0,
                accuracy: 0,
                currentRank: 'Unranked',
                points: 0
            };
        });

        // Get user predictions from UserService
        UserService.getUserPredictions(5).then(function(predictions) {
            vm.recentPredictions = predictions.map(function(prediction) {
                return {
                    id: prediction.id,
                    title: prediction.match || prediction.title || "Prediction #" + prediction.id,
                    userChoice: prediction.prediction || 'unknown',
                    status: prediction.status || (prediction.correct !== undefined ? 'resolved' : 'active'),
                    result: prediction.correct ? 'correct' : 'incorrect',
                    created_at: prediction.date || prediction.created_at,
                    end_date: prediction.end_date || prediction.date,
                    current_yes_percentage: prediction.current_yes_percentage || Math.floor(Math.random() * 100)
                };
            });
        }).catch(function(error) {
            console.error('Error loading user predictions:', error);
            vm.recentPredictions = [];
        });

        // Check if we should load actual Supabase users for admin/leaderboard
        vm.loadAllUsers();

        vm.isLoading = false;
    };

    // Load all users from Supabase (for admin or leaderboard display)
    vm.loadAllUsers = function() {
        // This will show real users from Supabase in console for debugging
        UserService.getAllUsers().then(function(users) {
            console.log('Real Supabase users:', users);
            vm.allUsers = users;
        }).catch(function(error) {
            console.error('Error loading all users:', error);
            vm.allUsers = [];
        });
    };

    // Navigation functions
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    vm.viewPrediction = function(predictionId) {
        $location.path('/predictions/' + predictionId);
    };

    // Utility functions
    vm.getPredictionStatusBadge = function(prediction) {
        if (prediction.status === 'resolved') {
            if (prediction.result === 'correct') {
                return { text: 'Won', class: 'bg-green-500' };
            } else {
                return { text: 'Lost', class: 'bg-red-500' };
            }
        }
        return { text: 'Active', class: 'bg-blue-500' };
    };

    vm.getUserChoice = function(prediction) {
        return prediction.userChoice === 'yes' ? 'YES' : 'NO';
    };

    vm.getUserChoiceClass = function(prediction) {
        return prediction.userChoice === 'yes' ? 'text-green-400' : 'text-red-400';
    };

    vm.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    vm.getAccuracyColor = function(accuracy) {
        if (accuracy >= 80) return 'text-green-400';
        if (accuracy >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    vm.getRankSuffix = function(rank) {
        const lastDigit = rank % 10;
        if (lastDigit === 1 && rank !== 11) return 'st';
        if (lastDigit === 2 && rank !== 12) return 'nd';
        if (lastDigit === 3 && rank !== 13) return 'rd';
        return 'th';
    };

    // Initialize
    vm.init = function() {
        if (!AuthService.isAuthenticated()) {
            $location.path('/auth');
            return;
        }
        vm.loadDashboard();
    };

    // Call init
    vm.init();
}]);
