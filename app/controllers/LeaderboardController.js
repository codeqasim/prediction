// Leaderboard Controller - Handles leaderboard functionality
angular.module('app').controller('LeaderboardController', ['$scope', '$location', 'UserService', 'AuthService',
function($scope, $location, UserService, AuthService) {
    const vm = this;

    // Page data
    vm.leaderboard = [];
    vm.currentUser = null;
    vm.currentUserRank = null;
    vm.isLoading = true;
    vm.filter = 'all'; // 'all', 'month', 'week'
    vm.limit = 50;

    // Load leaderboard data
    vm.loadLeaderboard = function() {
        vm.isLoading = true;

        UserService.getLeaderboard(vm.limit).then(function(users) {
            vm.leaderboard = users;
            vm.findCurrentUserRank();
            vm.isLoading = false;
            // Remove $scope.$apply() as promises automatically trigger digest cycle
        }).catch(function(error) {
            console.error('Error loading leaderboard:', error);
            vm.isLoading = false;
            // Remove $scope.$apply() as promises automatically trigger digest cycle
        });
    };

    // Find current user's rank
    vm.findCurrentUserRank = function() {
        if (!AuthService.isAuthenticated()) {
            return;
        }

        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            const userInLeaderboard = vm.leaderboard.find(function(user) {
                return user.id === currentUser.id;
            });

            if (userInLeaderboard) {
                vm.currentUserRank = userInLeaderboard.rank;
            }
        }
    };

    // Filter functions
    vm.setFilter = function(filter) {
        vm.filter = filter;
        // In a real app, you'd reload data with the filter
        vm.loadLeaderboard();
    };

    // Get user display name
    vm.getUserDisplayName = function(user) {
        if (user.username) {
            return user.username;
        }
        if (user.first_name && user.last_name) {
            return user.first_name + ' ' + user.last_name;
        }
        return user.email || 'Unknown User';
    };

    // Get rank display
    vm.getRankDisplay = function(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '#' + rank;
    };

    // Get rank class for styling
    vm.getRankClass = function(rank) {
        if (rank === 1) return 'text-yellow-400 bg-yellow-500/20';
        if (rank === 2) return 'text-gray-300 bg-gray-500/20';
        if (rank === 3) return 'text-orange-400 bg-orange-500/20';
        return 'text-white bg-white/10';
    };

    // Navigation
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    // Check if user is current user
    vm.isCurrentUser = function(user) {
        const currentUser = AuthService.getCurrentUser();
        return currentUser && user.id === currentUser.id;
    };

    // Initialize
    vm.init = function() {
        vm.loadLeaderboard();
    };

    // Call init
    vm.init();
}]);
