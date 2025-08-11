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

    vm.newPasswordForm = {
        password: '',
        confirmPassword: ''
    };

    // UI state
    vm.currentMode = 'login'; // 'login' or 'register'
    vm.isLoading = false;
    vm.errors = {};
    vm.showPassword = false;
    vm.showConfirmPassword = false;
    vm.showResetModal = false;
    vm.resetSent = false; // Track if reset email was sent
    vm.passwordUpdated = false; // Track if password was updated
    vm.passwordStrength = {
        score: 0,
        feedback: 'Weak',
        visible: false
    };
    vm.newPasswordStrength = {
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
                // Success message
                alert('Account created successfully! Welcome to Prediction AI!');
                $location.path('/dashboard');
            })
            .catch(function(error) {
                console.error('❌ Registration failed:', error);
                
                // Handle specific error cases
                if (error.message && error.message.includes('email')) {
                    vm.setFieldError('email', 'This email is already registered');
                } else if (error.message && error.message.includes('username')) {
                    vm.setFieldError('username', 'This username is already taken');
                } else {
                    vm.showError(AuthService.formatError(error));
                }
            })
            .finally(function() {
                vm.isLoading = false;
                $rootScope.setLoading(false);
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
        vm.resetSent = false;

        if (!vm.resetForm.email) {
            vm.setFieldError('resetEmail', 'Email is required');
            return;
        }

        if (!vm.isValidEmail(vm.resetForm.email)) {
            vm.setFieldError('resetEmail', 'Please enter a valid email address');
            return;
        }

        vm.isLoading = true;

        AuthService.resetPassword(vm.resetForm.email)
            .then(function() {
                vm.resetSent = true;
                vm.resetForm.email = '';
                
                // Auto redirect to login after 5 seconds
                setTimeout(function() {
                    $location.path('/login');
                    $scope.$apply();
                }, 5000);
            })
            .catch(function(error) {
                console.error('Reset password error:', error);
                vm.setFieldError('resetEmail', AuthService.formatError(error));
            })
            .finally(function() {
                vm.isLoading = false;
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

    // Password strength checker for new password
    vm.checkNewPasswordStrength = function() {
        const password = vm.newPasswordForm.password;

        if (!password) {
            vm.newPasswordStrength.visible = false;
            return;
        }

        vm.newPasswordStrength.visible = true;

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

        vm.newPasswordStrength.score = score;
        vm.newPasswordStrength.feedback = feedback;
    };

    // Update password function
    vm.updatePassword = function() {
        if (vm.isLoading) return;

        vm.clearErrors();
        vm.passwordUpdated = false;

        // Validation
        if (!vm.newPasswordForm.password) {
            vm.setFieldError('password', 'New password is required');
            return;
        }

        if (vm.newPasswordForm.password.length < 8) {
            vm.setFieldError('password', 'Password must be at least 8 characters long');
            return;
        }

        if (!vm.newPasswordForm.confirmPassword) {
            vm.setFieldError('confirmPassword', 'Please confirm your password');
            return;
        }

        if (vm.newPasswordForm.password !== vm.newPasswordForm.confirmPassword) {
            vm.setFieldError('confirmPassword', 'Passwords do not match');
            return;
        }

        vm.isLoading = true;

        // Since we've already established the session in initResetPassword,
        // we can directly call updatePassword without needing to extract tokens again
        AuthService.updatePassword(vm.newPasswordForm.password)
            .then(function() {
                vm.passwordUpdated = true;
                vm.newPasswordForm.password = '';
                vm.newPasswordForm.confirmPassword = '';
                
                // Auto redirect to login after 3 seconds
                setTimeout(function() {
                    $location.path('/login');
                    $scope.$apply();
                }, 3000);
            })
            .catch(function(error) {
                console.error('Update password error:', error);
                vm.showError(AuthService.formatError(error));
            })
            .finally(function() {
                vm.isLoading = false;
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

        // Check if we're on the reset password page and handle tokens
        if ($location.path() === '/reset-password') {
            vm.initResetPassword();
        }
    };

    // Initialize reset password page
    vm.initResetPassword = function() {
        console.log('🔄 Initializing reset password page...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Check for tokens in URL hash (Supabase format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        
        console.log('Extracted tokens:', { access_token: access_token ? 'present' : 'missing', refresh_token: refresh_token ? 'present' : 'missing' });
        
        if (access_token && refresh_token) {
            console.log('✅ Tokens found, setting session...');
            // Set session with Supabase
            AuthService.setSession(access_token, refresh_token)
                .then(function() {
                    console.log('✅ Session set successfully for password reset');
                })
                .catch(function(error) {
                    console.error('❌ Failed to set session:', error);
                    vm.showError('Invalid reset link. Please request a new password reset.');
                });
        } else {
            console.log('❌ No tokens found in URL');
            // Check if user already has a valid session
            AuthService.checkExistingAuth()
                .then(function(user) {
                    if (!user) {
                        console.log('❌ No existing session found');
                        vm.showError('Invalid reset link. Please request a new password reset.');
                    } else {
                        console.log('✅ Found existing session');
                    }
                })
                .catch(function(error) {
                    console.error('❌ No valid session found:', error);
                    vm.showError('Invalid reset link. Please request a new password reset.');
                });
        }
    };

    // Initialize
    vm.init();
}]);
