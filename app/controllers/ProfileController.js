// Profile Controller - Handles user profile management
angular.module('app').controller('ProfileController', ['$scope', '$location', '$timeout', 'UserService',
function($scope, $location, $timeout, UserService) {
    const vm = this;

    // Loading and saving states
    vm.isLoading = true;
    vm.isSaving = false;
    vm.isUploadingImage = false;
    vm.successMessage = '';
    vm.successMessage = '';
    vm.errorMessage = '';
    vm.formErrors = {};
    vm.selectedFile = null;
    vm.imagePreview = null;

    // User profile data
    vm.userProfile = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        bio: '',
        avatar_url: '',
        points: 0,
        stats: {
            total_predictions: 0,
            correct_predictions: 0,
            accuracy: 0
        }
    };

    // Enhanced initialization
    vm.init = function() {
        vm.loadUserProfile();
    };

    // Load user profile with enhanced error handling
    vm.loadUserProfile = function() {
        vm.isLoading = true;
        vm.errorMessage = '';

        UserService.getCurrentUser().then(function(user) {
            vm.userProfile = angular.extend(vm.userProfile, user);
            vm.isLoading = false;
        }).catch(function(error) {
            vm.errorMessage = 'Failed to load profile. Please try again.';
            vm.isLoading = false;
            console.error('Profile load error:', error);
        });
    };

    // Enhanced form validation
    vm.validateForm = function() {
        vm.formErrors = {};
        let isValid = true;

        // First name validation
        if (!vm.userProfile.first_name || vm.userProfile.first_name.trim().length < 2) {
            vm.formErrors.first_name = 'First name must be at least 2 characters long';
            isValid = false;
        }

        // Last name validation
        if (!vm.userProfile.last_name || vm.userProfile.last_name.trim().length < 2) {
            vm.formErrors.last_name = 'Last name must be at least 2 characters long';
            isValid = false;
        }

        // Phone validation (optional)
        if (vm.userProfile.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(vm.userProfile.phone)) {
            vm.formErrors.phone = 'Please enter a valid phone number';
            isValid = false;
        }

        // Bio length validation
        if (vm.userProfile.bio && vm.userProfile.bio.length > 500) {
            vm.formErrors.bio = 'Bio must be 500 characters or less';
            isValid = false;
        }

        return isValid;
    };

    // Enhanced save profile
    vm.saveProfile = function() {
        if (!vm.validateForm()) {
            vm.errorMessage = 'Please fix the errors below';
            return;
        }

        vm.isSaving = true;
        vm.errorMessage = '';
        vm.successMessage = '';

        const updateData = {
            first_name: vm.userProfile.first_name,
            last_name: vm.userProfile.last_name,
            phone: vm.userProfile.phone,
            bio: vm.userProfile.bio
        };

        UserService.updateUser(updateData).then(function(updatedUser) {
            vm.userProfile = angular.extend(vm.userProfile, updatedUser);
            vm.successMessage = 'Profile updated successfully!';
            vm.isSaving = false;

            // Clear success message after 5 seconds
            $timeout(function() {
                vm.successMessage = '';
            }, 5000);

        }).catch(function(error) {
            vm.errorMessage = error.message || 'Failed to update profile. Please try again.';
            vm.isSaving = false;
            console.error('Profile save error:', error);
        });
    };

    // Enhanced file selection with validation
    vm.onFileSelect = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // File validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            vm.errorMessage = 'Please select a valid image file (JPG, PNG, GIF, or WebP)';
            return;
        }

        if (file.size > maxSize) {
            vm.errorMessage = 'Image file must be smaller than 5MB';
            return;
        }

        vm.selectedFile = file;

        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            vm.imagePreview = e.target.result;
            $scope.$apply();
        };
        reader.readAsDataURL(file);

        vm.errorMessage = '';
        $scope.$apply();
    };

    // Enhanced image upload
    vm.uploadProfileImage = function() {
        if (!vm.selectedFile) return;

        vm.isUploadingImage = true;
        vm.errorMessage = '';

        UserService.uploadAvatar(vm.selectedFile).then(function(response) {
            vm.userProfile.avatar_url = response.avatar_url;
            vm.successMessage = 'Profile image updated successfully!';
            vm.selectedFile = null;
            vm.imagePreview = null;
            vm.isUploadingImage = false;

            // Clear file input
            const fileInput = document.getElementById('avatar-upload');
            if (fileInput) fileInput.value = '';

            $timeout(function() {
                vm.successMessage = '';
            }, 5000);

        }).catch(function(error) {
            vm.errorMessage = error.message || 'Failed to upload image. Please try again.';
            vm.isUploadingImage = false;
            console.error('Image upload error:', error);
        });
    };

    // Cancel image upload
    vm.cancelImageUpload = function() {
        vm.selectedFile = null;
        vm.imagePreview = null;
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput) fileInput.value = '';
    };

    // Enhanced navigation
    vm.navigateTo = function(path) {
        $location.path(path);
    };

    // Enhanced logout
    vm.logout = function() {
        if (confirm('Are you sure you want to sign out?')) {
            AuthService.logout().then(function() {
                $location.path('/');
            }).catch(function(error) {
                console.error('Logout error:', error);
                $location.path('/');
            });
        }
    };

    // Initialize controller
    vm.init();
}]);

// Enhanced page interactions
document.addEventListener('DOMContentLoaded', function() {
    // Auto-save draft functionality
    let saveTimeout;
    const inputs = document.querySelectorAll('#profile-form input, #profile-form textarea');

    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(function() {
                // Save draft to localStorage
                const formData = {};
                inputs.forEach(function(inp) {
                    if (inp.id) {
                        formData[inp.id] = inp.value;
                    }
                });
                localStorage.setItem('profileDraft', JSON.stringify(formData));
            }, 2000);
        });
    });

    // Restore draft on page load
    const savedDraft = localStorage.getItem('profileDraft');
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);
            Object.keys(draftData).forEach(function(key) {
                const input = document.getElementById(key);
                if (input && !input.value) {
                    input.value = draftData[key];
                }
            });
        } catch (e) {
            console.warn('Failed to restore draft:', e);
        }
    }

    // Clear draft on successful save
    document.addEventListener('profileSaved', function() {
        localStorage.removeItem('profileDraft');
    });
});
