 // Profile Page Controller Enhancement
    if (window.angular) {
        angular.module('app').controller('ProfileController', ['$scope', '$location', '$timeout', 'UserService', 'FileUploadService',
        function($scope, $location, $timeout, UserService, FileUploadService) {
            const ctrl = this;

            // Enhanced initialization
            ctrl.isLoading = true;
            ctrl.isSaving = false;
            ctrl.isUploadingImage = false;
            ctrl.successMessage = '';
            ctrl.errorMessage = '';
            ctrl.formErrors = {};
            ctrl.selectedFile = null;
            ctrl.imagePreview = null;

            // User profile data
            ctrl.userProfile = {
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                bio: '',
                location: '',
                website: '',
                avatar_url: '',
                points: 0,
                predictions_count: 0,
                accuracy: 0,
                rank: 0,
                streak: 0,
                created_at: new Date()
            };

            // Enhanced initialization
            ctrl.init = function() {
                ctrl.loadUserProfile();
            };

            // Load user profile with enhanced error handling
            ctrl.loadUserProfile = function() {
                ctrl.isLoading = true;
                ctrl.errorMessage = '';

                UserService.getCurrentUser().then(function(user) {
                    ctrl.userProfile = angular.extend(ctrl.userProfile, user);
                    ctrl.isLoading = false;
                }).catch(function(error) {
                    ctrl.errorMessage = 'Failed to load profile. Please try again.';
                    ctrl.isLoading = false;
                    console.error('Profile load error:', error);
                });
            };

            // Enhanced form validation
            ctrl.validateForm = function() {
                ctrl.formErrors = {};
                let isValid = true;

                // Username validation
                if (!ctrl.userProfile.username || ctrl.userProfile.username.length < 3) {
                    ctrl.formErrors.username = 'Username must be at least 3 characters long';
                    isValid = false;
                } else if (!/^[a-zA-Z0-9_]+$/.test(ctrl.userProfile.username)) {
                    ctrl.formErrors.username = 'Username can only contain letters, numbers, and underscores';
                    isValid = false;
                }

                // Email validation
                if (!ctrl.userProfile.email) {
                    ctrl.formErrors.email = 'Email is required';
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctrl.userProfile.email)) {
                    ctrl.formErrors.email = 'Please enter a valid email address';
                    isValid = false;
                }

                // Website validation
                if (ctrl.userProfile.website && !/^https?:\/\/.+\..+/.test(ctrl.userProfile.website)) {
                    ctrl.formErrors.website = 'Please enter a valid URL (http:// or https://)';
                    isValid = false;
                }

                // Bio length validation
                if (ctrl.userProfile.bio && ctrl.userProfile.bio.length > 500) {
                    ctrl.formErrors.bio = 'Bio must be 500 characters or less';
                    isValid = false;
                }

                return isValid;
            };

            // Enhanced save profile
            ctrl.saveProfile = function() {
                if (!ctrl.validateForm()) {
                    ctrl.errorMessage = 'Please fix the errors below';
                    return;
                }

                ctrl.isSaving = true;
                ctrl.errorMessage = '';
                ctrl.successMessage = '';

                UserService.updateProfile(ctrl.userProfile).then(function(response) {
                    ctrl.successMessage = 'Profile updated successfully!';
                    ctrl.isSaving = false;

                    // Clear success message after 5 seconds
                    $timeout(function() {
                        ctrl.successMessage = '';
                    }, 5000);

                }).catch(function(error) {
                    ctrl.errorMessage = error.data?.message || 'Failed to update profile. Please try again.';
                    ctrl.isSaving = false;
                    console.error('Profile save error:', error);
                });
            };

            // Enhanced file selection with validation
            ctrl.onFileSelect = function(event) {
                const file = event.target.files[0];
                if (!file) return;

                // File validation
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

                if (!allowedTypes.includes(file.type)) {
                    ctrl.errorMessage = 'Please select a valid image file (JPG, PNG, or GIF)';
                    return;
                }

                if (file.size > maxSize) {
                    ctrl.errorMessage = 'Image file must be smaller than 5MB';
                    return;
                }

                ctrl.selectedFile = file;

                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    ctrl.imagePreview = e.target.result;
                    $scope.$apply();
                };
                reader.readAsDataURL(file);

                ctrl.errorMessage = '';
                $scope.$apply();
            };

            // Enhanced image upload
            ctrl.uploadProfileImage = function() {
                if (!ctrl.selectedFile) return;

                ctrl.isUploadingImage = true;
                ctrl.errorMessage = '';

                FileUploadService.uploadAvatar(ctrl.selectedFile).then(function(response) {
                    ctrl.userProfile.avatar_url = response.data.avatar_url;
                    ctrl.successMessage = 'Profile image updated successfully!';
                    ctrl.selectedFile = null;
                    ctrl.imagePreview = null;
                    ctrl.isUploadingImage = false;

                    // Clear file input
                    document.getElementById('avatar-upload').value = '';

                    $timeout(function() {
                        ctrl.successMessage = '';
                    }, 5000);

                }).catch(function(error) {
                    ctrl.errorMessage = error.data?.message || 'Failed to upload image. Please try again.';
                    ctrl.isUploadingImage = false;
                    console.error('Image upload error:', error);
                });
            };

            // Cancel image upload
            ctrl.cancelImageUpload = function() {
                ctrl.selectedFile = null;
                ctrl.imagePreview = null;
                document.getElementById('avatar-upload').value = '';
            };

            // Remove profile image
            ctrl.removeProfileImage = function() {
                if (confirm('Are you sure you want to remove your profile image?')) {
                    ctrl.isUploadingImage = true;

                    UserService.removeAvatar().then(function() {
                        ctrl.userProfile.avatar_url = '';
                        ctrl.successMessage = 'Profile image removed successfully!';
                        ctrl.isUploadingImage = false;

                        $timeout(function() {
                            ctrl.successMessage = '';
                        }, 5000);

                    }).catch(function(error) {
                        ctrl.errorMessage = 'Failed to remove image. Please try again.';
                        ctrl.isUploadingImage = false;
                        console.error('Image removal error:', error);
                    });
                }
            };

            // Enhanced navigation
            ctrl.navigateTo = function(path) {
                $location.path(path);
            };

            // Enhanced logout
            ctrl.logout = function() {
                if (confirm('Are you sure you want to sign out?')) {
                    UserService.logout().then(function() {
                        $location.path('/');
                    }).catch(function(error) {
                        console.error('Logout error:', error);
                        $location.path('/');
                    });
                }
            };

            // Enhanced account deletion
            ctrl.deleteAccount = function() {
                const confirmation = prompt('Type "DELETE" to confirm account deletion:');
                if (confirmation === 'DELETE') {
                    if (confirm('This action cannot be undone. Are you absolutely sure?')) {
                        UserService.deleteAccount().then(function() {
                            alert('Your account has been deleted.');
                            $location.path('/');
                        }).catch(function(error) {
                            ctrl.errorMessage = 'Failed to delete account. Please contact support.';
                            console.error('Account deletion error:', error);
                        });
                    }
                }
            };

            // Initialize controller
            ctrl.init();
        }]);

        // Enhanced File Upload Service
        angular.module('app').service('FileUploadService', ['$http', '$q',
        function($http, $q) {

            this.uploadAvatar = function(file) {
                const formData = new FormData();
                formData.append('avatar', file);

                return $http.post('/api/user/avatar', formData, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                });
            };

            this.removeAvatar = function() {
                return $http.delete('/api/user/avatar');
            };
        }]);

        // Enhanced User Service methods
        angular.module('app').service('UserService', ['$http', '$q',
        function($http, $q) {

            this.getCurrentUser = function() {
                return $http.get('/api/user/profile').then(function(response) {
                    return response.data;
                });
            };

            this.updateProfile = function(profileData) {
                return $http.put('/api/user/profile', profileData);
            };

            this.removeAvatar = function() {
                return $http.delete('/api/user/avatar');
            };

            this.deleteAccount = function() {
                return $http.delete('/api/user/account');
            };

            this.logout = function() {
                return $http.post('/api/auth/logout');
            };
        }]);
    }

    // Enhanced page interactions
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-save draft functionality
        let saveTimeout;
        const inputs = document.querySelectorAll('input, textarea');

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