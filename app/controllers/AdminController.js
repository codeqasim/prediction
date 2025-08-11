// Admin Controller
angular.module('app').controller('AdminController', ['$scope', '$rootScope', '$location', '$timeout', 'AuthService', 'AdminService', function($scope, $rootScope, $location, $timeout, AuthService, AdminService) {
    var vm = this;

    // Initialize data
    vm.isLoading = true;
    vm.isRefreshing = false;
    vm.isSaving = false;
    vm.errorMessage = '';
    vm.successMessage = '';

    // User management
    vm.users = [];
    vm.filteredUsers = [];
    vm.userSearch = '';
    vm.showEditModal = false;
    vm.showDeleteModal = false;
    vm.editingUser = {};
    vm.userToDelete = {};
    vm.isDeleting = false;

    // Stats
    vm.stats = {
        totalUsers: 0,
        activeUsers: 0,
        totalCategories: 0,
        totalRecords: 0
    };

    // Tabs configuration
    vm.tabs = [
        { key: 'users', label: 'Users', icon: 'fas fa-users', count: 0 },
        { key: 'categories', label: 'Categories', icon: 'fas fa-tags', count: 0 },
        { key: 'predictions', label: 'Predictions', icon: 'fas fa-crystal-ball', count: 0 },
        { key: 'settings', label: 'Settings', icon: 'fas fa-cog', count: undefined }
    ];
    vm.activeTab = 'users';

    // Admin authentication state
    vm.isAdminAuthenticated = false;
    vm.adminPassword = 'adminz'; // Admin password

    // Initialize
    vm.init = function() {
        console.log('🔄 Initializing Admin Dashboard...');
        
        // Listen for authentication events
        $rootScope.$on('auth:login', function(event, user) {
            console.log('AdminController received auth:login, reloading users...');
            if (vm.isAdminAuthenticated && vm.users.length === 0) {
                vm.loadUsers();
            }
        });
        
        // Check if admin is already authenticated in session
        var adminAuth = sessionStorage.getItem('adminAuthenticated');
        if (adminAuth === 'true') {
            vm.isAdminAuthenticated = true;
            vm.loadData();
        } else {
            vm.promptAdminPassword();
        }
    };

    // Prompt for admin password
    vm.promptAdminPassword = function() {
        var password = prompt('Enter admin password to access dashboard:');
        
        if (password === null) {
            // User cancelled, redirect to home
            console.log('❌ Admin authentication cancelled');
            $location.path('/');
            return;
        }
        
        if (password === vm.adminPassword) {
            console.log('✅ Admin authenticated successfully');
            vm.isAdminAuthenticated = true;
            sessionStorage.setItem('adminAuthenticated', 'true');
            vm.loadData();
        } else {
            console.log('❌ Invalid admin password');
            alert('Invalid admin password. Access denied.');
            $location.path('/');
        }
    };

    // Admin logout
    vm.adminLogout = function() {
        vm.isAdminAuthenticated = false;
        sessionStorage.removeItem('adminAuthenticated');
        console.log('🔓 Admin logged out');
        $location.path('/');
    };

    // Load all data
    vm.loadData = function() {
        if (!vm.isAdminAuthenticated) {
            console.log('❌ Admin not authenticated, cannot load data');
            return;
        }
        
        vm.isLoading = true;

        Promise.all([
            vm.loadUsers(),
            vm.loadStats()
        ]).then(function() {
            vm.isLoading = false;
            console.log('✅ Admin data loaded successfully');
            $scope.$apply();
        }).catch(function(error) {
            vm.isLoading = false;
            vm.showError('Failed to load admin data: ' + error.message);
            console.error('❌ Failed to load admin data:', error);
            $scope.$apply();
        });
    };

    // Load users from Supabase
    vm.loadUsers = function() {
        console.log('🔄 Loading users...');

        return AdminService.getUsers()
            .then(function(response) {
                vm.users = response.data || [];
                vm.filteredUsers = vm.users.slice();
                vm.tabs[0].count = vm.users.length;
                vm.stats.totalUsers = vm.users.length;
                vm.stats.activeUsers = vm.users.filter(function(user) {
                    return user.email_confirmed_at;
                }).length;

                console.log('✅ Loaded ' + vm.users.length + ' users');
                // Use $timeout to safely trigger digest cycle
                $timeout(function() {
                    // This ensures UI updates safely
                }, 0);
                return vm.users;
            })
            .catch(function(error) {
                console.error('❌ Failed to load users:', error);
                
                // If it's an authentication error, don't show error message immediately
                if (error.message.includes('No authenticated user')) {
                    console.log('📝 Waiting for user authentication before loading users...');
                } else {
                    vm.showError('Failed to load users: ' + error.message);
                }
                return [];
            });
    };

    // Load statistics
    vm.loadStats = function() {
        // For now, calculate stats from loaded data
        // In the future, this could call specific stats endpoints
        vm.stats.totalCategories = 5; // Placeholder
        vm.stats.totalRecords = vm.stats.totalUsers + vm.stats.totalCategories;

        return Promise.resolve();
    };

    // Refresh data
    vm.refreshData = function() {
        vm.isRefreshing = true;

        vm.loadData().finally(function() {
            vm.isRefreshing = false;
            vm.showSuccess('Data refreshed successfully');
        });
    };

    // Tab management
    vm.setActiveTab = function(tabKey) {
        vm.activeTab = tabKey;
        console.log('📂 Switched to tab:', tabKey);
    };

    vm.getActiveTabLabel = function() {
        var activeTabObj = vm.tabs.find(function(tab) {
            return tab.key === vm.activeTab;
        });
        return activeTabObj ? activeTabObj.label : 'Unknown';
    };

    // User search
    vm.searchUsers = function() {
        if (!vm.userSearch) {
            vm.filteredUsers = vm.users.slice();
            return;
        }

        var searchTerm = vm.userSearch.toLowerCase();
        vm.filteredUsers = vm.users.filter(function(user) {
            var fullName = (user.user_metadata && user.user_metadata.full_name) || '';
            var email = user.email || '';

            return fullName.toLowerCase().includes(searchTerm) ||
                   email.toLowerCase().includes(searchTerm);
        });

        console.log('🔍 Search results:', vm.filteredUsers.length + ' users found');
    };

    // User CRUD operations
    vm.addUser = function() {
        vm.editingUser = {
            user_metadata: {
                full_name: ''
            },
            email: '',
            password: ''
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

        var operation = vm.editingUser.id ? 'update' : 'create';
        var promise = operation === 'create' ?
            AdminService.createUser(vm.editingUser) :
            AdminService.updateUser(vm.editingUser);

        promise.then(function(result) {
            vm.isSaving = false;
            vm.showEditModal = false;
            vm.showSuccess('User ' + (operation === 'create' ? 'created' : 'updated') + ' successfully');
            vm.loadUsers();
            $scope.$apply();
        }).catch(function(error) {
            vm.isSaving = false;
            vm.showError('Failed to ' + operation + ' user: ' + error.message);
            console.error('❌ Failed to ' + operation + ' user:', error);
            $scope.$apply();
        });
    };

    vm.deleteUser = function(user) {
        vm.userToDelete = angular.copy(user);
        vm.showDeleteModal = true;
    };

    vm.confirmDeleteUser = function() {
        if (vm.isDeleting) return;

        vm.isDeleting = true;

        AdminService.deleteUser(vm.userToDelete.id)
            .then(function() {
                vm.isDeleting = false;
                vm.showDeleteModal = false;
                vm.userToDelete = {};
                vm.showSuccess('User deleted successfully');
                vm.loadUsers();
                $scope.$apply();
            })
            .catch(function(error) {
                vm.isDeleting = false;
                vm.showError('Failed to delete user: ' + error.message);
                console.error('❌ Failed to delete user:', error);
                $scope.$apply();
            });
    };

    vm.cancelDeleteUser = function() {
        vm.showDeleteModal = false;
        vm.userToDelete = {};
        vm.isDeleting = false;
    };

    vm.viewUser = function(user) {
        vm.editingUser = angular.copy(user);
        vm.showEditModal = true;
        vm.editMode = 'view';
        
        // Populate form with user data
        vm.editingUser.full_name = (user.user_metadata && user.user_metadata.full_name) || '';
        vm.editingUser.display_email = user.email;
        vm.editingUser.display_status = user.email_confirmed_at ? 'Active' : 'Pending';
        vm.editingUser.display_created = vm.formatDate(user.created_at);
        vm.editingUser.display_last_signin = vm.formatDate(user.last_sign_in_at);
        vm.editingUser.display_id = user.id;
    };

    vm.closeEditModal = function() {
        vm.showEditModal = false;
        vm.editingUser = {};
        vm.editMode = 'edit'; // Reset to edit mode
    };

    // Utility functions
    vm.formatDate = function(dateString) {
        if (!dateString) return 'N/A';

        try {
            var date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Message handling
    vm.showError = function(message) {
        vm.errorMessage = message;
        setTimeout(function() {
            vm.clearError();
            $scope.$apply();
        }, 5000);
    };

    vm.showSuccess = function(message) {
        vm.successMessage = message;
        setTimeout(function() {
            vm.clearSuccess();
            $scope.$apply();
        }, 3000);
    };

    vm.clearError = function() {
        vm.errorMessage = '';
    };

    vm.clearSuccess = function() {
        vm.successMessage = '';
    };

    // Initialize the controller
    vm.init();
}]);
