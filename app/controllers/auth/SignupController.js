// Complete SignupController.js - Final Working Version
angular.module('app').controller('SignupController', ['$scope', '$location', 'SupabaseService',
function($scope, $location, SupabaseService) {
    console.log('🚀 SignupController loading...');

    // Test Supabase directly
    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; $scope.initialized = true;

    // Form data
    $scope.registerForm = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    };

    // UI state
    $scope.isLoading = false;
    $scope.errors = {};
    $scope.registrationSuccess = false;
    $scope.registeredEmail = '';
    $scope.usernameChecking = false;
    $scope.usernameStatus = '';
    $scope.passwordStrength = { score: 0, feedback: 'Weak', visible: false };

    // Clear autofill on page load
    setTimeout(function() {
        // $scope.registerForm.email = '';
        $scope.$apply();
    }, 100);

    // Username availability check - REAL SUPABASE ONLY
    $scope.checkUsernameAvailability = function() {
        console.log('🔍 Checking username availability...');
        const username = $scope.registerForm.username;

        // Clear previous status
        $scope.errors.username = '';
        $scope.usernameStatus = '';

        // Must be at least 3 characters
        if (!username || username.length < 3) {
            if (username && username.length > 0) {
                $scope.errors.username = 'Username must be at least 3 characters';
            }
            return;
        }

        $scope.usernameChecking = true;
        $scope.usernameStatus = 'Checking...';

        // Get Supabase client
        const client = SupabaseService.getClient();
        if (!client) {
            console.log('❌ No Supabase client available');
            $scope.errors.username = 'Database connection not available';
            $scope.usernameChecking = false;
            $scope.usernameStatus = '';
            return;
        }

        console.log('🔍 Checking username with Supabase:', username);

        // Check profiles table
        client.from('profiles')
            .select('username')
            .eq('username', username)
            .then(function(response) {
                console.log('Username check response:', response);

                if (response.data && response.data.length > 0) {
                    $scope.errors.username = 'Username already taken';
                    $scope.usernameStatus = '❌ Not available';
                    console.log('❌ Username taken');
                } else {
                    $scope.usernameStatus = '✅ Available';
                    console.log('✅ Username available');
                }
            })
            .catch(function(error) {
                console.error('Error checking username:', error);
                // For errors, assume available
                $scope.usernameStatus = '⚠️ Unable to verify';
                console.log('⚠️ Username check failed');
            })
            .finally(function() {
                $scope.usernameChecking = false;
                $scope.$apply();
            });
    };

    // Password strength checker
    $scope.checkPasswordStrength = function() {
        const password = $scope.registerForm.password;
        if (!password) {
            $scope.passwordStrength.visible = false;
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        $scope.passwordStrength = {
            score: score,
            feedback: score >= 4 ? 'Strong' : score >= 2 ? 'Medium' : 'Weak',
            visible: true
        };
    };

    // Form validation
    $scope.validateForm = function() {
        $scope.errors = {};
        let isValid = true;

        if (!$scope.registerForm.firstName?.trim()) {
            $scope.errors.firstName = 'First name is required';
            isValid = false;
        }

        if (!$scope.registerForm.lastName?.trim()) {
            $scope.errors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!$scope.registerForm.username?.trim()) {
            $scope.errors.username = 'Username is required';
            isValid = false;
        } else if ($scope.registerForm.username.trim().length < 3) {
            $scope.errors.username = 'Username must be at least 3 characters';
            isValid = false;
        }

        if (!$scope.registerForm.email?.trim()) {
            $scope.errors.email = 'Email is required';
            isValid = false;
        } else if (!$scope.registerForm.email.includes('@')) {
            $scope.errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!$scope.registerForm.password) {
            $scope.errors.password = 'Password is required';
            isValid = false;
        } else if ($scope.registerForm.password.length < 8) {
            $scope.errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (!$scope.registerForm.confirmPassword) {
            $scope.errors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if ($scope.registerForm.password !== $scope.registerForm.confirmPassword) {
            $scope.errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        if (!$scope.registerForm.agreeTerms) {
            $scope.errors.agreeTerms = 'You must agree to the terms and conditions';
            isValid = false;
        }

        return isValid;
    };

    // Main registration function
    $scope.register = function(event) {
    if (event) {
        event.preventDefault();
    }

    console.log('🚀 Register function called');

    // Prevent double submission
    if ($scope.isLoading) {
        console.log('Already processing, ignoring...');
        return;
    }

    // Reset any previous success state
    $scope.registrationSuccess = false;
    $scope.registeredEmail = '';

    // Clear previous errors
    $scope.errors = {};

    // Validate form
    if (!$scope.validateForm()) {
        console.log('❌ Form validation failed');
        const firstError = Object.keys($scope.errors)[0];
        $scope.showError('Please fix the form errors: ' + $scope.errors[firstError]);
        return;
    }

    // Check if username is taken
    if ($scope.usernameStatus.includes('❌')) {
        $scope.showError('Please choose a different username');
        return;
    }

    // Start loading
    $scope.isLoading = true;
    console.log('✅ Starting registration process...');

    // Prepare user data for Supabase
    const userData = {
        first_name: $scope.registerForm.firstName.trim(),
        last_name: $scope.registerForm.lastName.trim(),
        username: $scope.registerForm.username.trim()
    };

    const email = $scope.registerForm.email.trim();
    const password = $scope.registerForm.password;

    console.log('📤 Sending to Supabase:', {
        email: email,
        userData: userData
    });

    // Call Supabase auth with correct parameter structure
    SupabaseService.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData,
        emailRedirectTo: window.location.origin + '/login'
        }
    })
        .then(function(response) {
            console.log('📥 Registration response:', response);

            if (response.error) {
                throw new Error(response.error.message);
            }

            console.log('✅ Registration successful!');

            // Set success state
            $scope.registrationSuccess = true;
            $scope.registeredEmail = email;

            // Clear form data
            $scope.clearForm();

            // Show success message (will be handled by the UI with ng-if)
            console.log('✅ Registration completed. Email confirmation sent to:', email);
        })
        .catch(function(error) {
            console.error('❌ Registration failed:', error);
            $scope.handleRegistrationError(error);
        })
        .finally(function() {
            $scope.isLoading = false;
            console.log('🏁 Registration process completed');

            // Safe UI update - only apply if not already in digest cycle
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }

            $scope.scrollToTop = function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            };

        });
};

// Helper function to clear the form
$scope.clearForm = function() {
    $scope.registerForm = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    };

    // Clear password strength indicator
    if ($scope.passwordStrength) {
        $scope.passwordStrength.visible = false;
        $scope.passwordStrength.score = 0;
        $scope.passwordStrength.feedback = '';
    }

    // Clear username status
    $scope.usernameStatus = '';

    // Clear any form validation states
    if ($scope.signupForm) {
        $scope.signupForm.$setPristine();
        $scope.signupForm.$setUntouched();
    }
};

// Helper function to handle registration errors
$scope.handleRegistrationError = function(error) {
    let errorMessage = error.message || 'Registration failed';

    // Handle specific Supabase errors
    if (errorMessage.includes('User already registered') ||
        errorMessage.includes('email') && errorMessage.includes('already') ||
        errorMessage.includes('already exists')) {
        $scope.errors.email = 'This email is already registered';
        $scope.showError('This email is already registered. Please use a different email or try logging in.');
    }
    else if (errorMessage.includes('username') && errorMessage.includes('taken')) {
        $scope.errors.username = 'This username is already taken';
        $scope.showError('This username is already taken. Please choose a different username.');
    }
    else if (errorMessage.includes('Password should be at least')) {
        $scope.errors.password = 'Password is too weak';
        $scope.showError('Password is too weak. Please choose a stronger password.');
    }
    else if (errorMessage.includes('Invalid email')) {
        $scope.errors.email = 'Please enter a valid email address';
        $scope.showError('Please enter a valid email address.');
    }
    else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        $scope.showError('Too many registration attempts. Please wait a few minutes before trying again.');
    }
    else {
        $scope.errors.general = errorMessage;
        $scope.showError('Registration failed: ' + errorMessage);
    }
};

// Helper function to show error messages (you can customize this)
$scope.showError = function(message) {
    // You can replace alert with a better notification system
    // like toastr, sweet alert, or custom modal
    alert('❌ ' + message);

    // Or if you have a custom error display in your template
    // $scope.errorMessage = message;
    // $scope.showErrorMessage = true;
};

// Function to retry registration (optional)
$scope.retryRegistration = function() {
    $scope.registrationSuccess = false;
    $scope.registeredEmail = '';
    $scope.errors = {};
};

// Function to go to login (optional)
$scope.goToLogin = function() {
    // Navigate to login page
    // $location.path('/login');
    // or
    // $state.go('login');
    console.log('Navigate to login');
};

    // Resend confirmation email
    $scope.resendConfirmation = function() {
        if (!$scope.registeredEmail) {
            alert('❌ No email address found');
            return;
        }

        console.log('📧 Resending confirmation to:', $scope.registeredEmail);

        SupabaseService.auth.resetPassword($scope.registeredEmail)
            .then(function(response) {
                console.log('✅ Resend response:', response);
                alert('✅ Confirmation email sent to ' + $scope.registeredEmail);
            })
            .catch(function(error) {
                console.error('❌ Resend failed:', error);
                alert('❌ Failed to send confirmation email. Please try again.');
            });
    };

    // Clear autofill helper
    $scope.clearAutofill = function() {
        setTimeout(function() {
            $scope.registerForm.email = '';
            $scope.$apply();
        }, 100);
    };

    console.log('✅ SignupController loaded successfully');
}]);