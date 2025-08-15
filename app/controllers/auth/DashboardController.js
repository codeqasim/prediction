// Dashboard Controller - Handles user dashboard functionality
angular.module('app').controller('DashboardController', ['$scope', '$location', 'AuthService', 'SupabaseService',
function($scope, $location, AuthService, SupabaseService) {

    console.log('📊 Dashboard Controller Initialized');

    // User data
    $scope.currentUser = null;
    $scope.userStats = {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        currentRank: 'Unranked',
        points: 0
    };
    $scope.recentPredictions = [];
    $scope.isLoading = true;

    // Load dashboard data
    $scope.loadDashboard = function() {
        $scope.isLoading = true;

        // Get current user from AuthService
        $scope.currentUser = AuthService.getCurrentUser();
        if (!$scope.currentUser) {
            console.log('❌ No authenticated user found, redirecting to login');
            $location.path('/login');
            return;
        }

        console.log('✅ Authenticated user found:', $scope.currentUser.email);

        // Load user data from Supabase
        $scope.loadUserData();
    };

    // Load user data from Supabase
    $scope.loadUserData = function() {
        const client = SupabaseService.getClient();
        if (!client) {
            console.log('❌ No Supabase client available');
            $scope.isLoading = false;
            return;
        }

        // Load user profile from profiles table
        client.from('profiles')
            .select('*')
            .eq('id', $scope.currentUser.id)
            .single()
            .then(function(response) {
                if (response.data) {
                    console.log('✅ User profile loaded:', response.data);
                    $scope.userProfile = response.data;
                    $scope.userStats.points = response.data.points || 0;
                } else {
                    console.log('ℹ️ No profile found, creating default stats');
                }
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('❌ Error loading user profile:', error);
                $scope.$apply();
            });

        // TODO: Load predictions data when predictions table is available
        // For now, use default values
        $scope.userStats = {
            totalPredictions: 0,
            correctPredictions: 0,
            accuracy: 0,
            currentRank: 'Unranked',
            points: $scope.userStats.points || 0
        };

        $scope.recentPredictions = [];
        $scope.isLoading = false;
        $scope.$apply();
    };

    // Navigation functions
    $scope.navigateTo = function(path) {
        $location.path(path);
    };

    $scope.viewPrediction = function(predictionId) {
        $location.path('/predictions/' + predictionId);
    };

    // User functions
    $scope.logout = function() {
        AuthService.logout();
        $location.path('/');
    };

    // Utility functions
    $scope.getPredictionStatusBadge = function(prediction) {
        if (prediction.status === 'resolved') {
            if (prediction.result === 'correct') {
                return { text: 'Won', class: 'bg-green-500' };
            } else {
                return { text: 'Lost', class: 'bg-red-500' };
            }
        }
        return { text: 'Active', class: 'bg-blue-500' };
    };

    $scope.getUserChoice = function(prediction) {
        return prediction.userChoice === 'yes' ? 'YES' : 'NO';
    };

    $scope.getUserChoiceClass = function(prediction) {
        return prediction.userChoice === 'yes' ? 'text-green-400' : 'text-red-400';
    };

    $scope.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    $scope.getAccuracyColor = function(accuracy) {
        if (accuracy >= 80) return 'text-green-400';
        if (accuracy >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    $scope.getRankSuffix = function(rank) {
        if (typeof rank === 'string') return '';
        const lastDigit = rank % 10;
        if (lastDigit === 1 && rank !== 11) return 'st';
        if (lastDigit === 2 && rank !== 12) return 'nd';
        if (lastDigit === 3 && rank !== 13) return 'rd';
        return 'th';
    };

    // Initialize
    $scope.init = function() {
        console.log('🔄 Initializing dashboard...');
        
        // Check authentication
        if (!AuthService.isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to login');
            $location.path('/login');
            return;
        }
        
        $scope.loadDashboard();
    };

    // Call init
    $scope.init();
}]);
