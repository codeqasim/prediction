// Authentication Controller - Handles login, register, and password reset
angular.module('app').controller('AuthController', ['$scope', '$location', '$rootScope', 'AuthService', 'UserService',
function($scope, $location, $rootScope, AuthService, UserService) {
    const vm = this;

    // Form data
    vm.loginForm = {
        email: '',
        password: '',
        rememberMe: false
    };

    vm.registerForm = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    };

    vm.resetForm = {
        email: ''
    };

    // UI state
    vm.currentMode = 'login'; // 'login' or 'register'
    vm.isLoading = false;
    vm.errors = {};
    vm.showPassword = false;
    vm.showConfirmPassword = false;
    vm.showResetModal = false;
    vm.passwordStrength = {
        score: 0,
        feedback: 'Weak',
        visible: false
    };

    // Switch between login and register
    vm.switchMode = function(mode) {
        vm.currentMode = mode;
        vm.clearErrors();

        // Update URL without page reload
        if (mode === 'register') {
            $location.search('mode', 'register').replace();
        } else {
            $location.search('mode', null).replace();
        }
    };

    // Clear errors
    vm.clearErrors = function() {
        vm.errors = {};
    };

    // Set field error
    vm.setFieldError = function(field, message) {
        vm.errors[field] = message;
    };

    // Show general error
    vm.showError = function(message) {
        vm.errors.general = message;
    };

    // Login function
    vm.login = function() {
        if (vm.isLoading) return;

        vm.clearErrors();

        // Basic validation
        if (!vm.loginForm.email) {
            vm.setFieldError('email', 'Email is required');
            return;
        }
        if (!vm.loginForm.password) {
            vm.setFieldError('password', 'Password is required');
            return;
        }

        vm.isLoading = true;
        $rootScope.setLoading(true);

        AuthService.login(vm.loginForm.email, vm.loginForm.password)
            .then(function(user) {
                $location.path('/');
            })
            .catch(function(error) {
                console.error('❌ Login failed:', error);
                vm.showError(AuthService.formatError(error));
            })
            .finally(function() {
                vm.isLoading = false;
                $rootScope.setLoading(false);
                // Remove $scope.$apply() as promises automatically trigger digest cycle
            });
    };

    // Register function
    vm.register = function() {
        if (vm.isLoading) return;

        vm.clearErrors();

        // Validation
        if (!vm.validateRegisterForm()) {
            return;
        }

        vm.isLoading = true;
        $rootScope.setLoading(true);

        // Prepare user data
        const userData = {
            firstName: vm.registerForm.firstName,
            lastName: vm.registerForm.lastName,
            username: vm.registerForm.username
        };

        AuthService.register(vm.registerForm.email, vm.registerForm.password, userData)
            .then(function(user) {
                // Create user profile
                return UserService.createProfile(userData);
            })
            .then(function() {
                $location.path('/');
            })
            .catch(function(error) {
                console.error('❌ Registration failed:', error);
                vm.showError(AuthService.formatError(error));
            })
            .finally(function() {
                vm.isLoading = false;
                $rootScope.setLoading(false);
                // Remove $scope.$apply() as promises automatically trigger digest cycle
            });
    };

    // Validate register form
    vm.validateRegisterForm = function() {
        let isValid = true;

        if (!vm.registerForm.firstName) {
            vm.setFieldError('firstName', 'First name is required');
            isValid = false;
        }

        if (!vm.registerForm.lastName) {
            vm.setFieldError('lastName', 'Last name is required');
            isValid = false;
        }

        if (!vm.registerForm.username) {
            vm.setFieldError('username', 'Username is required');
            isValid = false;
        } else if (vm.registerForm.username.length < 3) {
            vm.setFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        }

        if (!vm.registerForm.email) {
            vm.setFieldError('email', 'Email is required');
            isValid = false;
        } else if (!vm.isValidEmail(vm.registerForm.email)) {
            vm.setFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!vm.registerForm.password) {
            vm.setFieldError('password', 'Password is required');
            isValid = false;
        } else if (vm.registerForm.password.length < 8) {
            vm.setFieldError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (vm.registerForm.password !== vm.registerForm.confirmPassword) {
            vm.setFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!vm.registerForm.agreeTerms) {
            vm.setFieldError('agreeTerms', 'You must agree to the terms');
            isValid = false;
        }

        return isValid;
    };

    // Email validation
    vm.isValidEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Password strength checker
    vm.checkPasswordStrength = function() {
        const password = vm.registerForm.password;

        if (!password) {
            vm.passwordStrength.visible = false;
            return;
        }

        vm.passwordStrength.visible = true;

        let score = 0;
        let feedback = 'Weak';

        // Length check
        if (password.length >= 8) score++;

        // Uppercase check
        if (/[A-Z]/.test(password)) score++;

        // Lowercase check
        if (/[a-z]/.test(password)) score++;

        // Number check
        if (/\d/.test(password)) score++;

        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score >= 4) {
            feedback = 'Strong';
        } else if (score >= 2) {
            feedback = 'Medium';
        }

        vm.passwordStrength.score = score;
        vm.passwordStrength.feedback = feedback;
    };

    // Password reset
    vm.resetPassword = function() {
        if (vm.isLoading) return;

        vm.clearErrors();

        if (!vm.resetForm.email) {
            vm.setFieldError('resetEmail', 'Email is required');
            return;
        }

        vm.isLoading = true;

        AuthService.resetPassword(vm.resetForm.email)
            .then(function() {
                alert('Password reset email sent! Check your inbox.');
                vm.showResetModal = false;
                vm.resetForm.email = '';
            })
            .catch(function(error) {
                console.error('Reset password error:', error);
                vm.setFieldError('resetEmail', AuthService.formatError(error));
            })
            .finally(function() {
                vm.isLoading = false;
                // Remove $scope.$apply() as promises automatically trigger digest cycle
            });
    };

    // Check username availability
    vm.checkUsernameAvailability = function() {
        if (!vm.registerForm.username || vm.registerForm.username.length < 3) {
            return;
        }

        UserService.checkUsername(vm.registerForm.username)
            .then(function(isAvailable) {
                if (!isAvailable) {
                    vm.setFieldError('username', 'Username is already taken');
                } else {
                    delete vm.errors.username;
                }
                // Remove $scope.$apply() as promises automatically trigger digest cycle
            })
            .catch(function(error) {
                console.error('Error checking username:', error);
            });
    };

    // Demo login for quick testing
    vm.demoLogin = function() {
        vm.loginForm.email = 'demo@example.com';
        vm.loginForm.password = 'demo123';
        vm.login();
    };

    // Initialize based on URL params
    vm.init = function() {
        const urlParams = new URLSearchParams($location.search());
        const mode = urlParams.get('mode');

        if (mode === 'register') {
            vm.currentMode = 'register';
        }
    };

    // Initialize
    vm.init();
}]);
