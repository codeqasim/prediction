// Predictions Controller - Handles predictions browsing and interaction
angular.module('app').controller('PredictionsController', ['$scope', '$location', '$routeParams', '$timeout', 'UserService', 'AuthService',
function($scope, $location, $routeParams, $timeout, UserService, AuthService) {
    const vm = this;

    // Page data
    vm.predictions = [];
    vm.featuredPredictions = [];
    vm.categories = ['Politics', 'Sports', 'Economics', 'Technology', 'Entertainment', 'Science'];
    vm.isLoading = true;
    vm.selectedCategory = $routeParams.category || 'all';
    vm.searchQuery = '';
    vm.sortBy = 'trending'; // 'trending', 'newest', 'ending_soon', 'most_popular'

    // Filters
    vm.filters = {
        category: 'all',
        status: 'active', // 'active', 'resolved', 'all'
        timeframe: 'all' // 'today', 'week', 'month', 'all'
    };

    // Load predictions
    vm.loadPredictions = function() {
        vm.isLoading = true;

        // Simulate API call - in real app, this would call a service
        $timeout(function() {
            vm.predictions = vm.generateSamplePredictions();
            vm.featuredPredictions = vm.predictions.slice(0, 3);
            vm.isLoading = false;
            // Remove $scope.$apply() as $timeout automatically triggers digest cycle
        }, 800);
    };

    // Generate sample predictions for demo
    vm.generateSamplePredictions = function() {
        const samplePredictions = [
            {
                id: 1,
                title: "Will Bitcoin reach $100,000 by end of 2024?",
                description: "Predict whether Bitcoin will hit the milestone of $100,000 USD by December 31st, 2024.",
                category: "Economics",
                end_date: "2024-12-31",
                total_predictions: 1250,
                yes_percentage: 67,
                no_percentage: 33,
                status: "active",
                featured: true,
                created_at: "2024-01-15",
                volume: 125000,
                image: null
            },
            {
                id: 2,
                title: "Will AI pass the Turing Test this year?",
                description: "Will an AI system pass a credible Turing Test as judged by computer science experts in 2024?",
                category: "Technology",
                end_date: "2024-12-31",
                total_predictions: 892,
                yes_percentage: 45,
                no_percentage: 55,
                status: "active",
                featured: true,
                created_at: "2024-02-01",
                volume: 89200,
                image: null
            },
            {
                id: 3,
                title: "Will SpaceX land humans on Mars by 2030?",
                description: "Predict if SpaceX will successfully land human astronauts on Mars by the end of 2030.",
                category: "Science",
                end_date: "2030-12-31",
                total_predictions: 2100,
                yes_percentage: 78,
                no_percentage: 22,
                status: "active",
                featured: true,
                created_at: "2024-01-10",
                volume: 210000,
                image: null
            },
            {
                id: 4,
                title: "Will the Lakers win the NBA Championship?",
                description: "Will the Los Angeles Lakers win the 2024 NBA Championship?",
                category: "Sports",
                end_date: "2024-06-30",
                total_predictions: 3400,
                yes_percentage: 34,
                no_percentage: 66,
                status: "active",
                featured: false,
                created_at: "2024-10-01",
                volume: 340000,
                image: null
            },
            {
                id: 5,
                title: "Will the next iPhone have a foldable screen?",
                description: "Will Apple release an iPhone with a foldable screen in 2024?",
                category: "Technology",
                end_date: "2024-12-31",
                total_predictions: 1780,
                yes_percentage: 23,
                no_percentage: 77,
                status: "active",
                featured: false,
                created_at: "2024-01-20",
                volume: 178000,
                image: null
            }
        ];

        return samplePredictions.filter(function(prediction) {
            // Apply filters
            if (vm.filters.category !== 'all' && prediction.category !== vm.filters.category) {
                return false;
            }
            if (vm.filters.status !== 'all' && prediction.status !== vm.filters.status) {
                return false;
            }
            if (vm.searchQuery && !prediction.title.toLowerCase().includes(vm.searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        });
    };

    // Filter functions
    vm.setCategory = function(category) {
        vm.filters.category = category;
        vm.loadPredictions();
    };

    vm.setStatus = function(status) {
        vm.filters.status = status;
        vm.loadPredictions();
    };

    vm.setSortBy = function(sortBy) {
        vm.sortBy = sortBy;
        vm.sortPredictions();
    };

    // Sort predictions
    vm.sortPredictions = function() {
        switch(vm.sortBy) {
            case 'newest':
                vm.predictions.sort(function(a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                break;
            case 'ending_soon':
                vm.predictions.sort(function(a, b) {
                    return new Date(a.end_date) - new Date(b.end_date);
                });
                break;
            case 'most_popular':
                vm.predictions.sort(function(a, b) {
                    return b.total_predictions - a.total_predictions;
                });
                break;
            case 'trending':
            default:
                vm.predictions.sort(function(a, b) {
                    return b.volume - a.volume;
                });
                break;
        }
    };

    // Search function
    vm.search = function() {
        vm.loadPredictions();
    };

    // Navigation
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    vm.viewPrediction = function(predictionId) {
        $location.path('/predictions/' + predictionId);
    };

    // Utility functions
    vm.getDaysUntilEnd = function(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    vm.getStatusBadge = function(prediction) {
        const daysLeft = vm.getDaysUntilEnd(prediction.end_date);
        if (daysLeft < 0) {
            return { text: 'Ended', class: 'bg-red-500' };
        } else if (daysLeft <= 7) {
            return { text: daysLeft + ' days left', class: 'bg-orange-500' };
        } else {
            return { text: daysLeft + ' days left', class: 'bg-green-500' };
        }
    };

    vm.formatVolume = function(volume) {
        if (volume >= 1000000) {
            return '$' + (volume / 1000000).toFixed(1) + 'M';
        } else if (volume >= 1000) {
            return '$' + (volume / 1000).toFixed(1) + 'K';
        } else {
            return '$' + volume;
        }
    };

    vm.getCategoryIcon = function(category) {
        const icons = {
            'Politics': 'account_balance',
            'Sports': 'sports',
            'Economics': 'trending_up',
            'Technology': 'computer',
            'Entertainment': 'movie',
            'Science': 'science'
        };
        return icons[category] || 'help';
    };

    // Initialize
    vm.init = function() {
        vm.loadPredictions();
    };

    // Call init
    vm.init();
}]);
