// Password Reset Controller - Handles password reset from email link
angular.module('app').controller('PasswordResetController', ['$scope', '$location', '$timeout', 'SupabaseService', 'AuthService',
function($scope, $location, $timeout, SupabaseService, AuthService) {

    // PREVENT DOUBLE INITIALIZATION
    if ($scope.initialized) return; 
    $scope.initialized = true;

    console.log('🔄 PasswordResetController initialized');

    // Form data
    $scope.newPasswordForm = {
        password: '',
        confirmPassword: ''
    };

    // UI state
    $scope.isLoading = false;
    $scope.errors = {};
    $scope.passwordUpdated = false;
    $scope.newPasswordStrength = {
        score: 0,
        feedback: 'Weak',
        visible: false
    };

    // Check for reset tokens in URL when controller loads
    $scope.checkResetTokens = function() {
        console.log('🔍 Checking for reset tokens in URL...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        
        // Check both URL params and hash params
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        
        console.log('🔍 Found tokens:', { 
            accessToken: accessToken ? 'Present' : 'Missing',
            refreshToken: refreshToken ? 'Present' : 'Missing', 
            type: type 
        });

        if (type !== 'recovery' || !accessToken) {
            console.log('❌ Invalid or missing reset tokens');
            $scope.errors.general = 'Invalid or expired reset link. Please request a new password reset.';
            
            // Redirect to forgot password after 3 seconds
            $timeout(function() {
                $location.path('/forgot-password');
            }, 3000);
            return;
        }

        console.log('✅ Valid reset tokens found, setting session...');
        
        // Set the session with the tokens
        const client = SupabaseService.getClient();
        if (!client) {
            $scope.errors.general = 'Service not available. Please try again later.';
            return;
        }

        client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        }).then(function(response) {
            console.log('Session response:', response);
            
            if (response.error) {
                console.error('❌ Session setting error:', response.error);
                $scope.errors.general = 'Invalid or expired reset link. Please request a new password reset.';
                $timeout(function() {
                    $location.path('/forgot-password');
                }, 3000);
            } else {
                console.log('✅ Session set successfully, user can now reset password');
                $scope.$apply();
            }
        }).catch(function(error) {
            console.error('❌ Session error:', error);
            $scope.errors.general = 'Failed to validate reset link. Please try again.';
            $scope.$apply();
        });
    };

    // Password strength checker
    $scope.checkNewPasswordStrength = function() {
        const password = $scope.newPasswordForm.password;
        
        if (!password || password.length === 0) {
            $scope.newPasswordStrength.visible = false;
            return;
        }

        $scope.newPasswordStrength.visible = true;
        let score = 0;
        let feedback = 'Weak';

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        // Determine feedback
        if (score >= 4) {
            feedback = 'Strong';
        } else if (score >= 2) {
            feedback = 'Medium';
        }

        $scope.newPasswordStrength.score = score;
        $scope.newPasswordStrength.feedback = feedback;
    };

    // Validate form
    $scope.validateForm = function() {
        $scope.errors = {};
        let isValid = true;

        // Password validation
        if (!$scope.newPasswordForm.password) {
            $scope.errors.password = 'New password is required';
            isValid = false;
        } else if ($scope.newPasswordForm.password.length < 8) {
            $scope.errors.password = 'Password must be at least 8 characters long';
            isValid = false;
        }

        // Confirm password validation
        if (!$scope.newPasswordForm.confirmPassword) {
            $scope.errors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if ($scope.newPasswordForm.password !== $scope.newPasswordForm.confirmPassword) {
            $scope.errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        return isValid;
    };

    // Update password function
    $scope.updatePassword = function(event) {
        if (event) {
            event.preventDefault();
        }

        console.log('🔄 Update password function called');

        // Prevent double submission
        if ($scope.isLoading || $scope.passwordUpdated) {
            console.log('Already processing or completed, ignoring...');
            return;
        }

        // Clear previous errors
        $scope.errors = {};

        // Validate form
        if (!$scope.validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }

        // Start loading
        $scope.isLoading = true;
        console.log('✅ Starting password update process...');

        const newPassword = $scope.newPasswordForm.password;
        const client = SupabaseService.getClient();

        if (!client) {
            $scope.errors.general = 'Service not available. Please try again later.';
            $scope.isLoading = false;
            return;
        }

        // Update the user's password
        client.auth.updateUser({
            password: newPassword
        })
        .then(function(response) {
            console.log('📥 Password update response:', response);

            if (response.error) {
                console.error('❌ Password update error:', response.error);
                $scope.errors.general = response.error.message || 'Failed to update password. Please try again.';
                $scope.isLoading = false;
            } else {
                console.log('✅ Password updated successfully!');
                $scope.passwordUpdated = true;
                $scope.isLoading = false;

                // Clear the form
                $scope.newPasswordForm = {
                    password: '',
                    confirmPassword: ''
                };

                // Sign out user and redirect to login after 3 seconds
                $timeout(function() {
                    console.log('🔄 Signing out user and redirecting to login...');
                    client.auth.signOut().then(function() {
                        $location.path('/login');
                        $scope.$apply();
                    });
                }, 3000);
            }

            // Safe UI update
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }
        })
        .catch(function(error) {
            console.error('❌ Password update failed:', error);
            $scope.errors.general = 'Failed to update password. Please try again.';
            $scope.isLoading = false;

            // Safe UI update
            if (!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply();
            }
        });
    };

    // Navigation functions
    $scope.goToLogin = function() {
        $location.path('/login');
    };

    $scope.goToForgotPassword = function() {
        $location.path('/forgot-password');
    };

    // Initialize - check for reset tokens when controller loads
    $scope.checkResetTokens();

    console.log('✅ PasswordResetController setup complete');
}]);
