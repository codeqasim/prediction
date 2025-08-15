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

        // First check localStorage for existing session
        AuthService.checkLocalStorage();

        // Get current user from AuthService
        $scope.currentUser = AuthService.getCurrentUser();

        console.log('Dashboard - Current user from AuthService:', $scope.currentUser);

        if (!$scope.currentUser) {
            // Also check directly from localStorage as fallback
            const storedUser = GET('currentUser');
            const isAuth = GET('isAuthenticated');

            console.log('Dashboard - Checking localStorage directly:', { storedUser, isAuth });

            if (storedUser && isAuth) {
                $scope.currentUser = storedUser;
                console.log('✅ Found user in localStorage:', $scope.currentUser.email);
            } else {
                console.log('ℹ️ No authenticated user found, using static data for demo');
                // Don't redirect - keep static data and show dashboard
                // $location.path('/login');
                // return;
            }
        } else {
            console.log('✅ Authenticated user found:', $scope.currentUser.email);
        }

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
                    // Don't overwrite our static data - keep the static values
                    // $scope.userStats.points = response.data.points || 0;
                } else {
                    console.log('ℹ️ No profile found, keeping static data');
                }
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('❌ Error loading user profile:', error);
                $scope.$apply();
            });

        // Keep our static data instead of resetting to defaults
        console.log('📊 Using static data for demo');
        
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

    // Safe display functions
    $scope.getUserDisplayName = function() {
        if ($scope.currentUser && $scope.currentUser.user_metadata && $scope.currentUser.user_metadata.full_name) {
            return $scope.currentUser.user_metadata.full_name;
        }
        if ($scope.currentUser && $scope.currentUser.email) {
            return $scope.currentUser.email.split('@')[0];
        }
        return 'Test User';
    };

    $scope.getUserEmail = function() {
        return $scope.currentUser ? $scope.currentUser.email : 'test@test.com';
    };

    $scope.getUserInitial = function() {
        if ($scope.currentUser && $scope.currentUser.email) {
            return $scope.currentUser.email[0].toUpperCase();
        }
        return 'T';
    };

    // Debug function (remove in production)
    $scope.debugAuth = function() {
        console.log('🔍 Dashboard Debug Info:');
        console.log('AuthService.isAuthenticated():', AuthService.isAuthenticated());
        console.log('AuthService.getCurrentUser():', AuthService.getCurrentUser());
        console.log('localStorage currentUser:', GET('currentUser'));
        console.log('localStorage isAuthenticated:', GET('isAuthenticated'));
        console.log('$scope.currentUser:', $scope.currentUser);
        alert('Check console for debug info');
    };

    // Utility functions
    $scope.getPredictionStatusBadge = function(prediction) {
        if (prediction.status === 'resolved') {
            if (prediction.result === 'correct') {
                return { text: 'Won', class: 'bg-green-500 text-white' };
            } else {
                return { text: 'Lost', class: 'bg-red-500 text-white' };
            }
        }
        return { text: 'Active', class: 'bg-blue-500 text-white' };
    };

    $scope.getUserChoice = function(prediction) {
        return prediction.userChoice === 'yes' ? 'YES' : 'NO';
    };

    $scope.getUserChoiceClass = function(prediction) {
        return prediction.userChoice === 'yes' ? 'text-green-600' : 'text-red-600';
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
        if (accuracy >= 80) return 'text-green-600';
        if (accuracy >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    $scope.getRankSuffix = function(rank) {
        if (typeof rank === 'string') return '';
        const lastDigit = rank % 10;
        if (lastDigit === 1 && rank !== 11) return 'st';
        if (lastDigit === 2 && rank !== 12) return 'nd';
        if (lastDigit === 3 && rank !== 13) return 'rd';
        return 'th';
    };

    // Math functions for template
    $scope.Math = Math;

    // Initialize
    $scope.init = function() {
        console.log('🔄 Initializing dashboard...');
        
        // Debug alert to see if controller is running
        console.log('🚨 DASHBOARD CONTROLLER IS RUNNING!');

        // Set comprehensive static values immediately to prevent template errors
        $scope.currentUser = {
            email: 'qasim@prediction.com',
            user_metadata: { full_name: 'Qasim Hussain' },
            id: 'user-qasim-123'
        };

        $scope.userStats = {
            totalPredictions: 47,
            correctPredictions: 32,
            accuracy: 68,
            currentRank: 15,
            points: 2850
        };

        $scope.recentPredictions = [
            {
                id: 1,
                title: 'Will Bitcoin reach $100,000 by end of 2025?',
                userChoice: 'yes',
                status: 'active',
                result: null,
                created_at: new Date('2025-08-10'),
                end_date: new Date('2025-12-31'),
                current_yes_percentage: 73
            },
            {
                id: 2,
                title: 'Will AI replace 50% of jobs by 2030?',
                userChoice: 'no',
                status: 'resolved',
                result: 'correct',
                created_at: new Date('2025-08-05'),
                end_date: new Date('2025-08-14'),
                current_yes_percentage: 42
            },
            {
                id: 3,
                title: 'Will Tesla stock hit $500 this quarter?',
                userChoice: 'yes',
                status: 'resolved',
                result: 'incorrect',
                created_at: new Date('2025-07-28'),
                end_date: new Date('2025-08-10'),
                current_yes_percentage: 58
            },
            {
                id: 4,
                title: 'Will there be a major earthquake in California this year?',
                userChoice: 'no',
                status: 'active',
                result: null,
                created_at: new Date('2025-07-20'),
                end_date: new Date('2025-12-31'),
                current_yes_percentage: 35
            },
            {
                id: 5,
                title: 'Will Netflix subscriber count exceed 300M by Q4?',
                userChoice: 'yes',
                status: 'active',
                result: null,
                created_at: new Date('2025-07-15'),
                end_date: new Date('2025-10-31'),
                current_yes_percentage: 67
            }
        ];

        $scope.isLoading = false;
        
        console.log('✅ Static data initialized successfully');
        console.log('📊 User Stats:', $scope.userStats);
        console.log('👤 Current User:', $scope.currentUser);
        console.log('📈 Recent Predictions:', $scope.recentPredictions.length, 'items');

        // Force a digest cycle to update the view
        $scope.$apply();

        // Optionally try to load real data (but don't overwrite static data)
        // $scope.loadDashboard();
    };

    // Call init
    $scope.init();
}]);
