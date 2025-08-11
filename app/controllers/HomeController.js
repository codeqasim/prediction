// Home Controller - Handles homepage functionality
angular.module('app').controller('HomeControllers', ['$scope', '$location', 'UserService', 'AuthService',
function($scope, $location, UserService, AuthService) {
    const vm = this;

    // Page data
    vm.stats = {
        totalUsers: 1247,
        totalPredictions: 5623,
        activePredictions: 156,
        accuracy: 73.2
    };

    vm.featuredPredictions = [];
    vm.topPredictors = [];
    vm.recentActivity = [];

    // Navigation functions
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    vm.startPredicting = function() {
        if (AuthService.isAuthenticated()) {
            $location.path('/predictions');
        } else {
            $location.path('/register');
        }
    };

    // Load page data
    vm.loadData = function() {
        // Load top predictors
        UserService.getLeaderboard(5).then(function(users) {
            vm.topPredictors = users;
            // Remove $scope.$apply() as it's handled automatically by AngularJS promises
        }).catch(function(error) {
            console.error('Error loading top predictors:', error);
        });

        // In a real app, you'd load featured predictions and recent activity here
        vm.featuredPredictions = [
            {
                id: 1,
                title: "Will AI replace 50% of jobs by 2030?",
                category: "Technology",
                participants: 1234,
                endDate: new Date(2030, 0, 1),
                icon: "smart_toy"
            },
            {
                id: 2,
                title: "Bitcoin to reach $100k in 2025?",
                category: "Finance",
                participants: 2456,
                endDate: new Date(2025, 11, 31),
                icon: "currency_bitcoin"
            },
            {
                id: 3,
                title: "Climate change agreement by 2026?",
                category: "Environment",
                participants: 987,
                endDate: new Date(2026, 5, 30),
                icon: "eco"
            }
        ];

        vm.recentActivity = [
            {
                user: "PredictionMaster",
                action: "predicted",
                prediction: "AI will replace 50% of jobs",
                timeAgo: "2 minutes ago"
            },
            {
                user: "FutureTeller",
                action: "won",
                prediction: "Stock market prediction",
                points: "+150 points",
                timeAgo: "5 minutes ago"
            },
            {
                user: "CryptoOracle",
                action: "predicted",
                prediction: "Bitcoin price movement",
                timeAgo: "8 minutes ago"
            }
        ];
    };

    // Initialize
    vm.init = function() {
        vm.loadData();
    };

    // Call init
    vm.init();
}]);
