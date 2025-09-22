// Complete SignupController.js - Final Working Version
angular.module('app').controller('SignupController', ['$scope', '$location', 'AuthService',
function($scope, $location, AuthService) {
    console.log('🚀 SignupController loading...');

    // Test Supabase directly
    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; $scope.initialized = true;

    // Form data
    $scope.registerForm = {
        firstName: '',
        lastName: '',
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
    $scope.passwordStrength = { score: 0, feedback: 'Weak', visible: false };

    // Clear autofill on page load
    setTimeout(function() {
        // $scope.registerForm.email = '';
        $scope.$apply();
    }, 100);

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
        // Removed username validation since username field is removed

        // Start loading
        $scope.isLoading = true;
        console.log('✅ Starting registration process...');

        // Prepare user data for our API - Generate username from email
        const emailUsername = $scope.registerForm.email.split('@')[0];
        const userData = {
            firstName: $scope.registerForm.firstName.trim(),
            lastName: $scope.registerForm.lastName.trim(),
            username: emailUsername, // Auto-generate from email
            email: $scope.registerForm.email.trim(),
            password: $scope.registerForm.password
        };

        console.log('📤 Sending to our API:', userData);

        // Call our new API
        AuthService.registerWithAPI(userData)
            .then(function(response) {
                console.log('📥 Registration response:', response);
                console.log('✅ Registration successful!');

                // Set success state
                $scope.registrationSuccess = true;
                $scope.registeredEmail = userData.email;

                // Clear form data
                $scope.clearForm();

                console.log('✅ Registration completed. User created:', response.data);
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

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
    };

// Helper function to clear the form
$scope.clearForm = function() {
    $scope.registerForm = {
        firstName: '',
        lastName: '',
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

    // Clear any form validation states
    if ($scope.signupForm) {
        $scope.signupForm.$setPristine();
        $scope.signupForm.$setUntouched();
    }
};

// Helper function to handle registration errors
$scope.handleRegistrationError = function(error) {
    let errorMessage = error.message || 'Registration failed';

    // Handle specific API errors
    if (errorMessage.includes('email is required') ||
        errorMessage.includes('Invalid email format')) {
        $scope.errors.email = errorMessage;
        $scope.showError('Please check your email address.');
    }
    else if (errorMessage.includes('password is required') ||
             errorMessage.includes('password')) {
        $scope.errors.password = errorMessage;
        $scope.showError('Please check your password.');
    }
    else if (errorMessage.includes('first_name is required')) {
        $scope.errors.firstName = 'First name is required';
        $scope.showError('Please enter your first name.');
    }
    else if (errorMessage.includes('last_name is required')) {
        $scope.errors.lastName = 'Last name is required';
        $scope.showError('Please enter your last name.');
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

    // Resend confirmation email - Disabled since we're not using email confirmation
    $scope.resendConfirmation = function() {
        if (!$scope.registeredEmail) {
            alert('❌ No email address found');
            return;
        }

        console.log('📧 Email confirmation not needed with current API');
        alert('✅ No email confirmation required! You can sign in directly.');
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