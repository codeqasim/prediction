// Public Profile Controller - Shows public user profile page
angular.module('app').controller('PublicProfileController', ['$scope', '$routeParams', '$location', 'SupabaseService',
function($scope, $routeParams, $location, SupabaseService) {

    console.log('👤 Public Profile Controller Initialized');
    console.log('Username from route:', $routeParams.username);

    // Initialize variables
    $scope.username = $routeParams.username;
    $scope.userProfile = null;
    $scope.userStats = {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        currentRank: 'Unranked',
        points: 0,
        joinDate: null,
        streakDays: 0
    };
    $scope.recentPredictions = [];
    $scope.isLoading = true;
    $scope.userNotFound = false;
    $scope.achievements = [];

    // Load user profile data
    $scope.loadUserProfile = function() {
        console.log('🔍 Loading profile for username:', $scope.username);
        
        const client = SupabaseService.getClient();
        if (!client) {
            console.log('❌ No Supabase client available');
            $scope.showStaticData();
            return;
        }

        // First get user profile by username
        client.from('profiles')
            .select(`
                *,
                users!inner(email, created_at)
            `)
            .eq('username', $scope.username)
            .single()
            .then(function(response) {
                console.log('👤 Profile response:', response);
                
                if (response.data) {
                    $scope.userProfile = response.data;
                    $scope.loadUserStats();
                    $scope.loadUserPredictions();
                } else {
                    console.log('❌ User not found');
                    $scope.userNotFound = true;
                    $scope.isLoading = false;
                }
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('❌ Error loading user profile:', error);
                if ($scope.username === 'qasim') {
                    console.log('📊 Loading static data for qasim demo');
                    $scope.showStaticData();
                } else {
                    $scope.userNotFound = true;
                    $scope.isLoading = false;
                }
                $scope.$apply();
            });
    };

    // Load user statistics
    $scope.loadUserStats = function() {
        const client = SupabaseService.getClient();
        
        // Load predictions to calculate stats
        client.from('user_predictions')
            .select('*')
            .eq('user_id', $scope.userProfile.id)
            .then(function(response) {
                if (response.data) {
                    $scope.calculateStats(response.data);
                }
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('❌ Error loading user stats:', error);
                $scope.$apply();
            });
    };

    // Load user's recent predictions
    $scope.loadUserPredictions = function() {
        const client = SupabaseService.getClient();
        
        client.from('user_predictions')
            .select(`
                *,
                predictions!inner(title, description, end_date, status)
            `)
            .eq('user_id', $scope.userProfile.id)
            .order('created_at', { ascending: false })
            .limit(10)
            .then(function(response) {
                if (response.data) {
                    $scope.recentPredictions = response.data;
                    console.log('📈 Loaded predictions:', response.data.length);
                }
                $scope.isLoading = false;
                $scope.$apply();
            })
            .catch(function(error) {
                console.error('❌ Error loading predictions:', error);
                $scope.isLoading = false;
                $scope.$apply();
            });
    };

    // Calculate user statistics
    $scope.calculateStats = function(predictions) {
        $scope.userStats.totalPredictions = predictions.length;
        $scope.userStats.correctPredictions = predictions.filter(p => p.result === 'correct').length;
        $scope.userStats.accuracy = $scope.userStats.totalPredictions > 0 
            ? Math.round(($scope.userStats.correctPredictions / $scope.userStats.totalPredictions) * 100)
            : 0;
        
        // Calculate streak (simplified)
        $scope.userStats.streakDays = $scope.calculateStreak(predictions);
        
        // Set join date
        if ($scope.userProfile && $scope.userProfile.users) {
            $scope.userStats.joinDate = new Date($scope.userProfile.users.created_at);
        }
    };

    // Calculate prediction streak
    $scope.calculateStreak = function(predictions) {
        // Simple streak calculation - consecutive correct predictions
        let streak = 0;
        const sortedPredictions = predictions.filter(p => p.status === 'resolved').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        for (let prediction of sortedPredictions) {
            if (prediction.result === 'correct') {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    };

    // Show static demo data
    $scope.showStaticData = function() {
        console.log('📊 Showing static data for demo');
        
        $scope.userProfile = {
            username: 'qasim',
            first_name: 'Qasim',
            last_name: 'Hussain',
            bio: '🔮 Prediction enthusiast with a passion for forecasting the future. Specializing in tech trends, crypto, and market predictions.',
            avatar_url: null,
            location: 'Dubai, UAE',
            website: 'https://prediction.com',
            users: {
                email: 'qasim@prediction.com',
                created_at: '2024-01-15'
            }
        };

        $scope.userStats = {
            totalPredictions: 47,
            correctPredictions: 32,
            accuracy: 68,
            currentRank: 15,
            points: 2850,
            joinDate: new Date('2024-01-15'),
            streakDays: 5
        };

        $scope.achievements = [
            { name: 'First Prediction', description: 'Made your first prediction', icon: '🎯', earned: true },
            { name: 'Hot Streak', description: '5 correct predictions in a row', icon: '🔥', earned: true },
            { name: 'Crystal Ball', description: '70%+ accuracy rate', icon: '🔮', earned: false },
            { name: 'Prophet', description: '100 correct predictions', icon: '👨‍🔬', earned: false }
        ];

        $scope.recentPredictions = [
            {
                id: 1,
                prediction_choice: 'yes',
                confidence: 85,
                result: 'correct',
                created_at: '2025-08-10',
                predictions: {
                    title: 'Will Bitcoin reach $100,000 by end of 2025?',
                    end_date: '2025-12-31',
                    status: 'resolved'
                }
            },
            {
                id: 2,
                prediction_choice: 'no',
                confidence: 92,
                result: 'correct',
                created_at: '2025-08-05',
                predictions: {
                    title: 'Will AI replace 50% of jobs by 2030?',
                    end_date: '2025-08-14',
                    status: 'resolved'
                }
            },
            {
                id: 3,
                prediction_choice: 'yes',
                confidence: 75,
                result: 'incorrect',
                created_at: '2025-07-28',
                predictions: {
                    title: 'Will Tesla stock hit $500 this quarter?',
                    end_date: '2025-08-10',
                    status: 'resolved'
                }
            }
        ];

        $scope.isLoading = false;
        $scope.userNotFound = false;
    };

    // Utility functions
    $scope.getDisplayName = function() {
        if ($scope.userProfile) {
            return ($scope.userProfile.first_name + ' ' + $scope.userProfile.last_name).trim() || $scope.userProfile.username;
        }
        return 'User';
    };

    $scope.getUserInitial = function() {
        if ($scope.userProfile && $scope.userProfile.first_name) {
            return $scope.userProfile.first_name[0].toUpperCase();
        }
        if ($scope.userProfile && $scope.userProfile.username) {
            return $scope.userProfile.username[0].toUpperCase();
        }
        return 'U';
    };

    $scope.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    $scope.getAccuracyColor = function(accuracy) {
        if (accuracy >= 80) return 'text-green-600';
        if (accuracy >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    $scope.getAccuracyBgColor = function(accuracy) {
        if (accuracy >= 80) return 'bg-green-500';
        if (accuracy >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    $scope.getPredictionBadge = function(prediction) {
        if (prediction.result === 'correct') {
            return { text: '✅ Correct', class: 'bg-green-100 text-green-800' };
        } else if (prediction.result === 'incorrect') {
            return { text: '❌ Wrong', class: 'bg-red-100 text-red-800' };
        } else {
            return { text: '⏳ Pending', class: 'bg-blue-100 text-blue-800' };
        }
    };

    $scope.shareProfile = function() {
        if (navigator.share) {
            navigator.share({
                title: `${$scope.getDisplayName()}'s Prediction Profile`,
                text: `Check out ${$scope.getDisplayName()}'s prediction accuracy: ${$scope.userStats.accuracy}%`,
                url: window.location.href
            });
        } else {
            // Fallback - copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(function() {
                alert('Profile link copied to clipboard!');
            });
        }
    };

    // Initialize
    $scope.init = function() {
        console.log('🔄 Initializing public profile...');
        console.log('👤 Loading profile for:', $scope.username);
        
        // Set page title
        document.title = `${$scope.username} - Prediction Profile`;
        
        $scope.loadUserProfile();
    };

    // Call init
    $scope.init();
}]);
