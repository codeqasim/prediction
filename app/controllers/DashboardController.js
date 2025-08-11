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

        // Simulate loading user stats and predictions
        $timeout(function() {
            vm.userStats = {
                totalPredictions: 45,
                correctPredictions: 38,
                accuracy: 84,
                currentRank: 12,
                points: 1850
            };

            vm.recentPredictions = [
                {
                    id: 1,
                    title: "Will Bitcoin reach $100,000 by end of 2024?",
                    userChoice: "yes",
                    status: "active",
                    created_at: "2024-07-15",
                    end_date: "2024-12-31",
                    current_yes_percentage: 67
                },
                {
                    id: 2,
                    title: "Will AI pass the Turing Test this year?",
                    userChoice: "no",
                    status: "active",
                    created_at: "2024-07-10",
                    end_date: "2024-12-31",
                    current_yes_percentage: 45
                },
                {
                    id: 3,
                    title: "Will the Lakers win the NBA Championship?",
                    userChoice: "no",
                    status: "resolved",
                    result: "correct",
                    created_at: "2024-06-15",
                    end_date: "2024-06-30",
                    current_yes_percentage: 34
                }
            ];

            vm.isLoading = false;
            // Remove $scope.$apply() as $timeout automatically triggers digest cycle
        }, 800);
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
