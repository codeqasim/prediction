// Points Policy Controller - Shows points system information
angular.module('app').controller('PointsPolicyController', ['$scope', '$location',
function($scope, $location) {
    console.log('PointsPolicyController initialized');

    // Page title and meta information
    $scope.pageTitle = 'Points Policy';
    $scope.pageDescription = 'Learn how our points system works and how you can earn rewards';

    // Points earning rules
    $scope.pointsRules = [
        {
            icon: 'add_circle',
            title: 'Account Registration',
            description: 'Get started with bonus points when you create your account',
            points: 100,
            color: 'text-green-400'
        },
        {
            icon: 'psychology',
            title: 'Make a Prediction',
            description: 'Earn points for each prediction you make',
            points: 10,
            color: 'text-blue-400'
        },
        {
            icon: 'check_circle',
            title: 'Correct Prediction',
            description: 'Bonus points when your predictions are accurate',
            points: 50,
            color: 'text-purple-400'
        },
        {
            icon: 'local_fire_department',
            title: 'Daily Streak',
            description: 'Maintain daily activity to earn streak bonuses',
            points: 25,
            color: 'text-orange-400'
        },
        {
            icon: 'star',
            title: 'Achievement Unlocked',
            description: 'Complete challenges to unlock achievement rewards',
            points: 200,
            color: 'text-yellow-400'
        },
        {
            icon: 'groups',
            title: 'Referral Bonus',
            description: 'Invite friends and earn points for each successful referral',
            points: 150,
            color: 'text-pink-400'
        }
    ];

    // Point redemption options
    $scope.redemptionOptions = [
        {
            icon: 'workspace_premium',
            title: 'Premium Features',
            description: 'Unlock advanced analytics and premium predictions',
            cost: 1000,
            color: 'text-purple-400'
        },
        {
            icon: 'badge',
            title: 'Profile Badges',
            description: 'Show off your achievements with exclusive badges',
            cost: 500,
            color: 'text-blue-400'
        },
        {
            icon: 'trending_up',
            title: 'Leaderboard Boost',
            description: 'Get temporary ranking boosts on the leaderboard',
            cost: 300,
            color: 'text-green-400'
        },
        {
            icon: 'card_giftcard',
            title: 'Gift Cards',
            description: 'Redeem points for digital gift cards and rewards',
            cost: 2000,
            color: 'text-orange-400'
        }
    ];

    // Leaderboard tiers
    $scope.leaderboardTiers = [
        { name: 'Bronze', minPoints: 0, maxPoints: 999, color: 'text-orange-600', icon: 'military_tech' },
        { name: 'Silver', minPoints: 1000, maxPoints: 4999, color: 'text-gray-400', icon: 'military_tech' },
        { name: 'Gold', minPoints: 5000, maxPoints: 9999, color: 'text-yellow-500', icon: 'military_tech' },
        { name: 'Platinum', minPoints: 10000, maxPoints: 24999, color: 'text-blue-400', icon: 'workspace_premium' },
        { name: 'Diamond', minPoints: 25000, maxPoints: null, color: 'text-purple-500', icon: 'diamond' }
    ];

    // FAQ section
    $scope.faqItems = [
        {
            question: 'How long do points last?',
            answer: 'Points never expire! Once you earn them, they stay in your account forever.',
            isOpen: false
        },
        {
            question: 'Can I transfer points to another user?',
            answer: 'Points are non-transferable and tied to your account for security reasons.',
            isOpen: false
        },
        {
            question: 'What happens if I delete my account?',
            answer: 'All points and achievements will be permanently lost if you delete your account.',
            isOpen: false
        },
        {
            question: 'How are prediction accuracy bonuses calculated?',
            answer: 'Accuracy bonuses are based on the difficulty of the prediction and your overall accuracy rate.',
            isOpen: false
        },
        {
            question: 'Can I earn points for past predictions?',
            answer: 'Points are only awarded for new predictions made after the system launch.',
            isOpen: false
        }
    ];

    // Toggle FAQ item
    $scope.toggleFaqItem = function(index) {
        $scope.faqItems[index].isOpen = !$scope.faqItems[index].isOpen;
    };

    // Navigation function
    $scope.navigateTo = function(path) {
        $location.path(path);
    };

    // Get tier for points
    $scope.getTierForPoints = function(points) {
        for (let tier of $scope.leaderboardTiers) {
            if (points >= tier.minPoints && (tier.maxPoints === null || points <= tier.maxPoints)) {
                return tier;
            }
        }
        return $scope.leaderboardTiers[0]; // Default to Bronze
    };

    // Format number with commas
    $scope.formatNumber = function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    console.log('Points Policy page loaded with', $scope.pointsRules.length, 'earning rules');
}]);
