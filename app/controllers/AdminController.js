angular.module('app').controller('AdminController', ['$scope', '$timeout', 'AdminService',
function($scope, $timeout, AdminService) {
    var vm = this;

    // Data
    vm.users = [];
    vm.filteredUsers = [];
    vm.userSearch = '';
    vm.editingUser = {};
    vm.userToDelete = {};

    // UI state
    vm.isLoading = true;
    vm.isSaving = false;
    vm.isDeleting = false;
    vm.showEditModal = false;
    vm.showDeleteModal = false;
    vm.activeTab = 'users';

    // Messages
    vm.errorMessage = '';
    vm.successMessage = '';

    // Stats
    vm.stats = {
        totalUsers: 0,
        activeUsers: 0
    };

    // Initialize
    vm.init = function() {
        console.log('🔄 Initializing Admin Dashboard...');
        vm.loadUsers();
    };

    // Load users
    vm.loadUsers = function() {
        console.log('🔄 Loading users...');
        vm.isLoading = true;

        AdminService.getUsers()
            .then(function(response) {
                vm.users = response.data || [];
                vm.filteredUsers = vm.users.slice();
                vm.updateStats();
                console.log('✅ Loaded', vm.users.length, 'users');
            })
            .catch(function(error) {
                console.error('❌ Failed to load users:', error);
                vm.showError('Failed to load users: ' + error.message);
            })
            .finally(function() {
                vm.isLoading = false;
            });
    };

    // Update statistics
    vm.updateStats = function() {
        vm.stats.totalUsers = vm.users.length;
        vm.stats.activeUsers = vm.users.filter(function(user) {
            return user.email_confirmed_at;
        }).length;
    };

    // Search users
    vm.searchUsers = function() {
        if (!vm.userSearch) {
            vm.filteredUsers = vm.users.slice();
            return;
        }

        var searchTerm = vm.userSearch.toLowerCase();
        vm.filteredUsers = vm.users.filter(function(user) {
            var name = (user.user_metadata && user.user_metadata.full_name) || '';
            var email = user.email || '';
            return name.toLowerCase().includes(searchTerm) ||
                   email.toLowerCase().includes(searchTerm);
        });
    };

    // User operations
    vm.addUser = function() {
        vm.editingUser = {
            user_metadata: { full_name: '' },
            email: '',
            username: ''
        };
        vm.showEditModal = true;
    };

    vm.editUser = function(user) {
        vm.editingUser = angular.copy(user);
        if (!vm.editingUser.user_metadata) {
            vm.editingUser.user_metadata = { full_name: '' };
        }
        vm.showEditModal = true;
    };

    vm.saveUser = function() {
        if (vm.isSaving) return;

        vm.isSaving = true;
        var isUpdate = !!vm.editingUser.id;

        var promise = isUpdate ?
            AdminService.updateUser(vm.editingUser.id, vm.editingUser) :
            AdminService.createUser(vm.editingUser);

        promise
            .then(function() {
                vm.showEditModal = false;
                vm.showSuccess('User ' + (isUpdate ? 'updated' : 'created') + ' successfully');
                vm.loadUsers();
            })
            .catch(function(error) {
                vm.showError('Failed to save user: ' + error.message);
            })
            .finally(function() {
                vm.isSaving = false;
            });
    };

    vm.deleteUser = function(user) {
        vm.userToDelete = user;
        vm.showDeleteModal = true;
    };

    vm.confirmDelete = function() {
        if (vm.isDeleting) return;

        vm.isDeleting = true;

        AdminService.deleteUser(vm.userToDelete.id)
            .then(function() {
                vm.showDeleteModal = false;
                vm.showSuccess('User deleted successfully');
                vm.loadUsers();
            })
            .catch(function(error) {
                vm.showError('Failed to delete user: ' + error.message);
            })
            .finally(function() {
                vm.isDeleting = false;
            });
    };

    vm.cancelDelete = function() {
        vm.showDeleteModal = false;
        vm.userToDelete = {};
    };

    vm.closeModal = function() {
        vm.showEditModal = false;
        vm.editingUser = {};
    };

    // Utility functions
    vm.formatDate = function(dateString) {
        if (!dateString) return 'N/A';
        try {
            var date = new Date(dateString);
            return date.toLocaleDateString() + ' ' +
                   date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch (error) {
            return 'Invalid Date';
        }
    };

    vm.getUserStatus = function(user) {
        return user.email_confirmed_at ? 'Active' : 'Pending';
    };

    vm.getUserName = function(user) {
        if (user.user_metadata && user.user_metadata.full_name) {
            return user.user_metadata.full_name;
        }
        if (user.user_metadata && user.user_metadata.first_name) {
            return user.user_metadata.first_name + ' ' + (user.user_metadata.last_name || '');
        }
        return user.email || 'Unknown';
    };

    // Message handling
    vm.showError = function(message) {
        vm.errorMessage = message;
        $timeout(function() {
            vm.errorMessage = '';
        }, 5000);
    };

    vm.showSuccess = function(message) {
        vm.successMessage = message;
        $timeout(function() {
            vm.successMessage = '';
        }, 3000);
    };

    // Refresh data
    vm.refresh = function() {
        vm.loadUsers();
        vm.showSuccess('Data refreshed');
    };

    // Initialize
    vm.init();
}]);