// Authentication Service - Handles user authentication
angular.module('app').service('AuthService', ['$rootScope', '$q', 'SupabaseService',
function($rootScope, $q, SupabaseService) {
    let currentUser = null;
    let authListener = null;

    // Check if user is authenticated
    this.isAuthenticated = function() {
        return currentUser !== null;
    };

    // Get current user
    this.getCurrentUser = function() {
        return currentUser;
    };

    // Set current user
    this.setCurrentUser = function(user) {
        console.log('AuthService setCurrentUser called with:', user);
        currentUser = user;
        
        // Store user in localStorage using app.js GET/SET functions
        if (user) {
            SET('currentUser', user);
            SET('isAuthenticated', true);
            console.log('User stored in localStorage:', user);
            console.log('Broadcasting auth:login');
            $rootScope.$broadcast('auth:login', user);
        } else {
            DEL('currentUser');
            DEL('isAuthenticated');
            console.log('User removed from localStorage');
            console.log('Broadcasting auth:logout');
            $rootScope.$broadcast('auth:logout');
        }
    };

    // Check for user in localStorage first
    this.checkLocalStorage = function() {
        const storedUser = GET('currentUser');
        const isAuth = GET('isAuthenticated');
        
        console.log('Checking localStorage for user:', storedUser);
        console.log('Is authenticated from storage:', isAuth);
        
        if (storedUser && isAuth) {
            currentUser = storedUser;
            console.log('User found in localStorage, setting currentUser');
            $rootScope.$broadcast('auth:login', currentUser);
            return true;
        }
        return false;
    };

    // Check existing authentication
    this.checkExistingAuth = function() {
        const deferred = $q.defer();

        // First check localStorage
        if (this.checkLocalStorage()) {
            deferred.resolve(currentUser);
            return deferred.promise;
        }

        // If no localStorage, check Supabase session
        SupabaseService.auth.getSession().then(function(response) {
            if (response.data && response.data.session && response.data.session.user) {
                currentUser = response.data.session.user;
                // Store in localStorage
                SET('currentUser', currentUser);
                SET('isAuthenticated', true);
                $rootScope.$broadcast('auth:login', currentUser);
                deferred.resolve(currentUser);
            } else {
                currentUser = null;
                // Clean localStorage
                DEL('currentUser');
                DEL('isAuthenticated');
                deferred.resolve(null);
            }
        }).catch(function(error) {
            console.error('Error checking existing auth:', error);
            currentUser = null;
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Login
    this.login = function(email, password) {
        console.log('AuthService login called with:', email);
        const deferred = $q.defer();

        SupabaseService.auth.signIn(email, password).then(function(response) {
            console.log('Login response:', response);
            if (response.error) {
                deferred.reject(response.error);
            } else if (response.data && response.data.user) {
                console.log('Setting current user:', response.data.user);
                currentUser = response.data.user;
                $rootScope.$broadcast('auth:login', currentUser);
                deferred.resolve(currentUser);
            } else {
                deferred.reject(new Error('Login failed - no user data received'));
            }
        }).catch(function(error) {
            console.error('Login error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Register
    this.register = function(email, password, userData = {}) {
        const deferred = $q.defer();

        const options = {
            data: userData
        };

        SupabaseService.auth.signUp(email, password, options).then(function(response) {
            if (response.error) {
                deferred.reject(response.error);
            } else if (response.data && response.data.user) {
                // Note: User might need to confirm email before being fully authenticated
                deferred.resolve(response.data.user);
            } else {
                deferred.reject(new Error('Registration failed - no user data received'));
            }
        }).catch(function(error) {
            console.error('Registration error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Logout
    this.logout = function() {
        const deferred = $q.defer();

        SupabaseService.auth.signOut().then(function() {
            currentUser = null;
            // Clear localStorage
            DEL('currentUser');
            DEL('isAuthenticated');
            console.log('Logout successful - localStorage cleared');
            $rootScope.$broadcast('auth:logout');
            deferred.resolve();
        }).catch(function(error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear local state
            currentUser = null;
            // Clear localStorage even if Supabase logout fails
            DEL('currentUser');
            DEL('isAuthenticated');
            console.log('Logout error - localStorage still cleared');
            $rootScope.$broadcast('auth:logout');
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Reset password
    this.resetPassword = function(email) {
        const deferred = $q.defer();

        SupabaseService.auth.resetPassword(email).then(function(response) {
            if (response.error) {
                deferred.reject(response.error);
            } else {
                deferred.resolve(response.data);
            }
        }).catch(function(error) {
            console.error('Reset password error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Update password
    this.updatePassword = function(newPassword) {
        const deferred = $q.defer();

        SupabaseService.auth.updatePassword(newPassword).then(function(response) {
            if (response.error) {
                deferred.reject(response.error);
            } else {
                deferred.resolve(response.data);
            }
        }).catch(function(error) {
            console.error('Update password error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Set session (for password reset)
    this.setSession = function(accessToken, refreshToken) {
        const deferred = $q.defer();

        SupabaseService.auth.setSession(accessToken, refreshToken).then(function(response) {
            if (response.error) {
                deferred.reject(response.error);
            } else {
                if (response.data && response.data.user) {
                    currentUser = response.data.user;
                    $rootScope.$broadcast('auth:login', currentUser);
                }
                deferred.resolve(response.data);
            }
        }).catch(function(error) {
            console.error('Set session error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Initialize auth state listener
    this.initAuthListener = function() {
        if (authListener) {
            return; // Already initialized
        }

        authListener = SupabaseService.auth.onAuthStateChange(function(event, session) {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session && session.user) {
                currentUser = session.user;
                $rootScope.$broadcast('auth:login', currentUser);
                
                // If this is the first sign in after email confirmation, create user profile
                if (session.user.email_confirmed_at && !session.user.user_metadata?.profile_created) {
                    console.log('Creating user profile after email confirmation...');
                    // You can call UserService.createProfile here if needed
                }
                
                $rootScope.$apply();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                $rootScope.$broadcast('auth:logout');
                $rootScope.$apply();
            }
        });
    };

    // Format auth errors for user display
    this.formatError = function(error) {
        if (!error) return 'Unknown error occurred';

        const errorMap = {
            'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
            'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
            'User already registered': 'An account with this email already exists. Try signing in instead.',
            'Password is too weak': 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers.',
            'Rate limit exceeded': 'Too many attempts. Please wait a moment before trying again.',
            'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another reset.'
        };

        return errorMap[error.message] || error.message || 'An error occurred. Please try again.';
    };

    // Initialize auth listener when service is created
    this.initAuthListener();
}]);
