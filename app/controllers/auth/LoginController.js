// Complete LoginController.js - Final Working Version
angular.module('app').controller('LoginController', ['$scope', '$location', 'SupabaseService', 'AuthService',
function($scope, $location, SupabaseService, AuthService) {
    console.log('🚀 LoginController loading...');

    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; $scope.initialized = true;

    // Form data
    $scope.loginForm = {
        email: '',
        password: '',
        remember: false
    };

    // UI state
    $scope.isLoading = false;
    $scope.errors = {};
    $scope.loginSuccess = false;
    $scope.userEmail = '';
    $scope.showActivationSuccess = false;

    // Check for activation success parameter
    $scope.checkActivationStatus = function() {
        console.log('🔍 Checking activation status...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const activated = urlParams.get('activated');
        
        if (activated === 'true') {
            $scope.showActivationSuccess = true;
            console.log('✅ Account activation detected - showing success message');
            
            // Simple auto-redirect after 3 seconds
            setTimeout(function() {
                window.location.href = '/dashboard';
            }, 3000);
        }
    };

    // Clear autofill on page load
    setTimeout(function() {
        $scope.$apply();
    }, 100);

    // Form validation
    $scope.validateForm = function() {
        $scope.errors = {};
        let isValid = true;

        if (!$scope.loginForm.email?.trim()) {
            $scope.errors.email = 'Email is required';
            isValid = false;
        } else if (!$scope.loginForm.email.includes('@')) {
            $scope.errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!$scope.loginForm.password) {
            $scope.errors.password = 'Password is required';
            isValid = false;
        } else if ($scope.loginForm.password.length < 6) {
            $scope.errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        return isValid;
    };

    // Main login function
    $scope.login = function(event) {
        if (event) {
            event.preventDefault();
        }

        console.log('🚀 Login function called');

        // Prevent double submission
        if ($scope.isLoading) {
            console.log('Already processing, ignoring...');
            return;
        }

        // Reset any previous success state
        $scope.loginSuccess = false;
        $scope.userEmail = '';

        // Clear previous errors
        $scope.errors = {};

        // Validate form
        if (!$scope.validateForm()) {
            console.log('❌ Form validation failed');
            const firstError = Object.keys($scope.errors)[0];
            $scope.showError('Please fix the form errors: ' + $scope.errors[firstError]);
            return;
        }

        // Start loading
        $scope.isLoading = true;
        console.log('✅ Starting login process...');

        const email = $scope.loginForm.email.trim();
        const password = $scope.loginForm.password;

        console.log('📤 Sending to Supabase:', {
            email: email
        });

        // Add debugging log to check actual form values
        console.log('Form values debug:', {
            email: $scope.loginForm.email,
            password: $scope.loginForm.password ? '***hidden***' : 'MISSING',
            emailLength: email.length,
            passwordLength: password.length
        });


            // Get the Supabase client directly
            const client = SupabaseService.getClient();

            if (!client) {
            throw new Error('Supabase client not available');
            }

            // Use the raw client method
            client.auth.signInWithPassword({
            email: email,
            password: password
            })

            .then(function(response) {
                console.log('📥 Login response:', response);

                if (response.error) {
                    throw new Error(response.error.message);
                }

                // Check if user is verified (commented out for testing)
                // if (!response.data.user.email_confirmed_at) {
                //     throw new Error('Please verify your email address before logging in. Check your inbox for the verification email.');
                // }

                console.log('✅ Login successful!');

                // Set user in AuthService (this will handle localStorage automatically)
                AuthService.setCurrentUser(response.data.user);

                console.log('💾 User set in AuthService and localStorage');

                // Set success state
                $scope.loginSuccess = true;
                $scope.userEmail = email;

                // Clear form data
                $scope.clearForm();

                // Redirect to dashboard after short delay
                setTimeout(function() {
                    $location.path('/dashboard');
                    $scope.$apply();
                }, 1000);

                console.log('✅ Login completed. Redirecting to dashboard...');
            })
            .catch(function(error) {
                console.error('❌ Login failed:', error);
                $scope.handleLoginError(error);
            })
            .finally(function() {
                $scope.isLoading = false;
                console.log('🏁 Login process completed');

                // Safe UI update - only apply if not already in digest cycle
                if (!$scope.$$phase && !$scope.$root.$$phase) {
                    $scope.$apply();
                }

                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
    };

    // Helper function to clear the form
    $scope.clearForm = function() {
        $scope.loginForm = {
            email: '',
            password: '',
            remember: false
        };

        // Clear any form validation states
        if ($scope.loginForm) {
            // Reset form if available
        }
    };

    // Helper function to handle login errors
    $scope.handleLoginError = function(error) {
        let errorMessage = error.message || 'Login failed';

        // Handle specific Supabase errors
        if (errorMessage.includes('Invalid login credentials') ||
            errorMessage.includes('Invalid email or password')) {
            $scope.errors.general = 'Invalid email or password. Please try again.';
            $scope.showError('Invalid email or password. Please try again.');
        }
        else if (errorMessage.includes('Email not confirmed') ||
            errorMessage.includes('verify your email')) {
            $scope.errors.email = 'Please verify your email address first';
            $scope.showError('Please verify your email address before logging in.');
        }
        else if (errorMessage.includes('Too many requests')) {
            $scope.showError('Too many login attempts. Please wait a few minutes before trying again.');
        }
        else if (errorMessage.includes('User not found')) {
            $scope.errors.email = 'No account found with this email';
            $scope.showError('No account found with this email. Please sign up first.');
        }
        else {
            $scope.errors.general = errorMessage;
            $scope.showError('Login failed: ' + errorMessage);
        }
    };

    // Helper function to show error messages
    $scope.showError = function(message) {
        // You can replace alert with a better notification system
        alert('❌ ' + message);
    };

    // Function to dismiss activation success message
    $scope.dismissActivationSuccess = function() {
        $scope.showActivationSuccess = false;
        window.location.href = '/dashboard';
    };

    // Function to go to signup
    $scope.goToSignup = function() {
        $location.path('/signup');
    };

    // Function to go to forgot password
    $scope.goToForgotPassword = function() {
        // Navigate to forgot password page
        $location.path('/forgot-password');
    };

    // Test login function (remove after testing)
    $scope.testLogin = function() {
        console.log('🧪 Testing with predefined credentials...');
        $scope.loginForm.email = 'test@test.com';
        $scope.loginForm.password = 'password123';
        $scope.login();
    };

    // Test signup function (remove after testing)
    $scope.testSignup = function() {
        console.log('🧪 Creating test user...');
        
        const client = SupabaseService.getClient();
        if (!client) {
            alert('❌ Supabase not available');
            return;
        }

        client.auth.signUp({
            email: 'test@test.com',
            password: 'password123',
            options: {
                data: {
                    first_name: 'Test',
                    last_name: 'User',
                    username: 'testuser'
                }
            }
        })
        .then(function(response) {
            console.log('📥 Signup response:', response);
            if (response.error) {
                alert('❌ Signup failed: ' + response.error.message);
            } else {
                alert('✅ Test user created successfully! You can now try logging in.');
            }
        })
        .catch(function(error) {
            console.error('❌ Signup error:', error);
            alert('❌ Signup error: ' + error.message);
        });
    };

    // Forgot password function
    $scope.forgotPassword = function() {
        if (!$scope.loginForm.email) {
            $scope.showError('Please enter your email address first');
            return;
        }

        console.log('📧 Sending password reset to:', $scope.loginForm.email);

        SupabaseService.auth.resetPassword({
            email: $scope.loginForm.email
        })
            .then(function(response) {
                console.log('✅ Password reset response:', response);
                alert('✅ Password reset email sent to ' + $scope.loginForm.email);
            })
            .catch(function(error) {
                console.error('❌ Password reset failed:', error);
                alert('❌ Failed to send password reset email. Please try again.');
            });
    };

    // Check if user is already logged in
    $scope.checkExistingLogin = function() {
        // Don't check if we're showing activation message
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('activated') === 'true') {
            return; // Let activation message show first
        }
        
        if (AuthService.isAuthenticated()) {
            window.location.href = '/dashboard';
        }
    };

    // Initialize
    $scope.init = function() {
        console.log('🔄 Initializing Login Controller...');

        $scope.checkActivationStatus();
        $scope.checkExistingLogin();

        console.log('✅ Login Controller loaded successfully');
    };

    // Call init
    $scope.init();
}]);