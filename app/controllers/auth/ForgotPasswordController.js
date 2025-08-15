// Complete ForgotPasswordController.js - Final Working Version
angular.module('app').controller('ForgotPasswordController', ['$scope', '$location', 'SupabaseService',
function($scope, $location, SupabaseService) {

    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; $scope.initialized = true;

    // Form data
    $scope.resetForm = {
        email: ''
    };

    // UI state
    $scope.isLoading = false;
    $scope.errors = {};
    $scope.resetSent = false;
    $scope.resetEmail = '';

    // Clear autofill on page load
    setTimeout(function() {
        $scope.$apply();
    }, 100);

    // Form validation
    $scope.validateForm = function() {
        $scope.errors = {};
        let isValid = true;

        if (!$scope.resetForm.email?.trim()) {
            $scope.errors.resetEmail = 'Email is required';
            isValid = false;
        } else if (!$scope.resetForm.email.includes('@')) {
            $scope.errors.resetEmail = 'Please enter a valid email address';
            isValid = false;
        }

        return isValid;
    };

    // Main password reset function - sends reset email
$scope.resetPassword = function(event) {
    if (event) {
        event.preventDefault();
    }

    console.log('🚀 Reset password function called');

    // Prevent double submission
    if ($scope.isLoading) {
        console.log('Already processing, ignoring...');
        return;
    }

    // Reset any previous success state
    $scope.resetSent = false;
    $scope.resetEmail = '';

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
    console.log('✅ Starting password reset process...');

    const email = $scope.resetForm.email.trim();
    console.log('📤 Processing reset for:', email);

    // Send reset email with proper redirect to password-reset page
    const client = SupabaseService.getClient();

    client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#!/password-reset'
    })
        .then(function(response) {
            console.log('📥 Reset email response:', response);

            if (response.error) {
                // Check if it's "user not found" type error
                if (response.error.message.includes('User not found') ||
                    response.error.message.includes('Invalid email')) {
                    throw new Error('No account found with this email address');
                } else {
                    throw new Error(response.error.message);
                }
            }

            console.log('✅ Reset email sent successfully!');

            // Set success state
            $scope.resetSent = true;
            $scope.resetEmail = email;

            // Clear form data
            $scope.clearForm();

            // Show success message
            $scope.showResetSuccess(email);

            console.log('✅ Password reset email sent to:', email);
        })
        .catch(function(error) {
            console.error('❌ Password reset failed:', error);
            $scope.handleResetError(error);
        })
        .finally(function() {
            $scope.isLoading = false;
            console.log('🏁 Password reset process completed');

            // Safe UI update
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
};

// Generate secure password
$scope.generatePassword = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Show success message for reset email
$scope.showResetSuccess = function(email) {
    console.log('✅ Showing reset success message for:', email);
    // alert('🔐 PASSWORD RESET EMAIL SENT!\n\nWe\'ve sent a password reset link to:\n' + email + '\n\nPlease check your email and click the link to reset your password.\n\n(Check your spam folder if you don\'t see it)');
};

    // Helper function to clear the form
    $scope.clearForm = function() {
        $scope.resetForm = {
            email: ''
        };
    };

    // Helper function to handle reset errors
    $scope.handleResetError = function(error) {
        let errorMessage = error.message || 'Password reset failed';

        // Handle specific errors
        if (errorMessage.includes('No account found') ||
            errorMessage.includes('User not found')) {
            $scope.errors.resetEmail = 'No account found with this email';
            $scope.showError('No account found with this email address. Please check the email or sign up first.');
        }
        else if (errorMessage.includes('verify your email') ||
            errorMessage.includes('email not confirmed')) {
            $scope.errors.resetEmail = 'Please verify your email first';
            $scope.showError('Please verify your email address before resetting password.');
        }
        else if (errorMessage.includes('Too many requests')) {
            $scope.showError('Too many password reset attempts. Please wait a few minutes before trying again.');
        }
        else if (errorMessage.includes('Unable to verify user')) {
            $scope.showError('Unable to verify user account. Please try again later.');
        }
        else {
            $scope.errors.general = errorMessage;
            $scope.showError('Password reset failed: ' + errorMessage);
        }
    };

    // Helper function to show error messages
    $scope.showError = function(message) {
        alert('❌ ' + message);
    };

    // Function to go to login
    $scope.goToLogin = function() {
        $location.path('/login');
    };

    // Function to go to signup
    $scope.goToSignup = function() {
        $location.path('/signup');
    };

    // Initialize
    $scope.init = function() {
        console.log('🔄 Initializing Forgot Password Controller...');
        console.log('✅ Forgot Password Controller loaded successfully');
    };

    // Call init
    $scope.init();
}]);