// Prediction Detail Controller - Handles individual prediction details
angular.module('app').controller('PredictionDetailController', ['$scope', '$location', '$routeParams', '$timeout', 'AuthService',
function($scope, $location, $routeParams, $timeout, AuthService) {
    console.log('🔮 Prediction Detail Controller Initialized');

    const vm = this;
    vm.predictionId = $routeParams.id;
    vm.prediction = null;
    vm.relatedPredictions = [];
    vm.isLoading = true;

    // Load prediction details
    vm.loadPrediction = function() {
        vm.isLoading = true;

        // Simulate API call - in real app, this would call a service
        $timeout(function() {
            vm.prediction = vm.findPrediction(vm.predictionId);
            vm.loadRelatedPredictions();
            vm.isLoading = false;
            // Remove $scope.$apply() as $timeout automatically triggers digest cycle
        }, 600);
    };

    // Find prediction by ID (sample data)
    vm.findPrediction = function(id) {
        const samplePredictions = [
            {
                id: 1,
                title: "Will Bitcoin reach $100,000 by end of 2024?",
                description: "Predict whether Bitcoin will hit the milestone of $100,000 USD by December 31st, 2024. This prediction considers various market factors including institutional adoption, regulatory changes, and global economic conditions.",
                category: "Economics",
                end_date: "2024-12-31",
                total_predictions: 1250,
                yes_percentage: 67,
                no_percentage: 33,
                status: "active",
                created_at: "2024-01-15",
                volume: 125000
            },
            {
                id: 2,
                title: "Will AI pass the Turing Test this year?",
                description: "Will an AI system pass a credible Turing Test as judged by computer science experts in 2024? The test must be conducted by a recognized institution and evaluated by independent experts.",
                category: "Technology",
                end_date: "2024-12-31",
                total_predictions: 892,
                yes_percentage: 45,
                no_percentage: 55,
                status: "active",
                created_at: "2024-02-01",
                volume: 89200
            },
            {
                id: 3,
                title: "Will SpaceX land humans on Mars by 2030?",
                description: "Predict if SpaceX will successfully land human astronauts on Mars by the end of 2030. This includes a successful landing, survival for at least 24 hours, and return capability demonstration.",
                category: "Science",
                end_date: "2030-12-31",
                total_predictions: 2100,
                yes_percentage: 78,
                no_percentage: 22,
                status: "active",
                created_at: "2024-01-10",
                volume: 210000
            },
            {
                id: 4,
                title: "Will the Lakers win the NBA Championship?",
                description: "Will the Los Angeles Lakers win the 2024 NBA Championship? This prediction covers the current NBA season ending in 2024.",
                category: "Sports",
                end_date: "2024-06-30",
                total_predictions: 3400,
                yes_percentage: 34,
                no_percentage: 66,
                status: "active",
                created_at: "2024-10-01",
                volume: 340000
            },
            {
                id: 5,
                title: "Will the next iPhone have a foldable screen?",
                description: "Will Apple release an iPhone with a foldable screen in 2024? The device must be officially announced and available for purchase by consumers.",
                category: "Technology",
                end_date: "2024-12-31",
                total_predictions: 1780,
                yes_percentage: 23,
                no_percentage: 77,
                status: "active",
                created_at: "2024-01-20",
                volume: 178000
            }
        ];

        return samplePredictions.find(function(p) {
            return p.id == id;
        });
    };

    // Load related predictions
    vm.loadRelatedPredictions = function() {
        if (!vm.prediction) return;

        // Sample related predictions (in real app, would filter by category)
        vm.relatedPredictions = [
            { id: 6, title: "Will Ethereum reach $5,000 by end of 2024?" },
            { id: 7, title: "Will a new cryptocurrency enter the top 3 by market cap?" },
            { id: 8, title: "Will the US approve a Bitcoin ETF this year?" }
        ].filter(function(p) {
            return p.id != vm.predictionId;
        }).slice(0, 3);
    };

    // Make a prediction
    vm.makePrediction = function(choice) {
        if (!AuthService.isAuthenticated()) {
            $location.path('/auth');
            return;
        }

        // In real app, this would submit to backend


        // Show success message or update UI
        alert('Prediction submitted! Choice: ' + choice.toUpperCase());
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
        return diffDays > 0 ? diffDays : 0;
    };

    vm.getStatusBadge = function(prediction) {
        const daysLeft = vm.getDaysUntilEnd(prediction.end_date);
        if (daysLeft <= 0) {
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

    vm.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
        if (!vm.predictionId) {
            $location.path('/predictions');
            return;
        }
        vm.loadPrediction();
    };

    // Call init
    vm.init();
}]);
