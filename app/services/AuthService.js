// Authentication Service - Simple API-based authentication
angular.module('app').service('AuthService', ['$rootScope', '$q', 'API_BASE_URL',
function($rootScope, $q, API_BASE_URL) {
    let currentUser = null;

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

        // Store user in localStorage
        if (user) {
            SET('currentUser', user);
            SET('isAuthenticated', true);
            console.log('User stored in localStorage:', user);
            $rootScope.$broadcast('auth:login', user);
        } else {
            DEL('currentUser');
            DEL('isAuthenticated');
            console.log('User removed from localStorage');
            $rootScope.$broadcast('auth:logout');
        }
    };

    // Check for user in localStorage
    this.checkLocalStorage = function() {
        const storedUser = GET('currentUser');
        const isAuth = GET('isAuthenticated');

        console.log('Checking localStorage for user:', storedUser);

        if (storedUser && isAuth) {
            currentUser = storedUser;
            console.log('User found in localStorage, setting currentUser');
            $rootScope.$broadcast('auth:login', currentUser);
            return true;
        }
        return false;
    };

    // Register with API
    this.registerWithAPI = function(userData) {
        console.log('AuthService registerWithAPI called with:', userData);
        const deferred = $q.defer();

        // Make API call to signup endpoint
        fetch(API_BASE_URL + '/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password,
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName
            })
        })
        .then(function(response) {
            return response.json().then(function(data) {
                if (response.ok && data.status) {
                    console.log('Registration successful:', data);
                    deferred.resolve(data);
                } else {
                    console.error('Registration failed:', data);
                    deferred.reject(new Error(data.message || 'Registration failed'));
                }
            });
        })
        .catch(function(error) {
            console.error('Registration error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Login with API
    this.login = function(email, password) {
        console.log('AuthService login called with:', email);
        const deferred = $q.defer();

        // Make API call to login endpoint
        fetch(API_BASE_URL + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(function(response) {
            return response.json().then(function(data) {
                if (response.ok && data.status) {
                    console.log('Login successful:', data);
                    currentUser = data.data;
                    SET('currentUser', currentUser);
                    SET('isAuthenticated', true);
                    $rootScope.$broadcast('auth:login', currentUser);
                    deferred.resolve(currentUser);
                } else {
                    console.error('Login failed:', data);
                    deferred.reject(new Error(data.message || 'Login failed'));
                }
            });
        })
        .catch(function(error) {
            console.error('Login error:', error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    // Logout
    this.logout = function() {
        const deferred = $q.defer();

        // Clear local state
        currentUser = null;
        DEL('currentUser');
        DEL('isAuthenticated');
        console.log('Logout successful - localStorage cleared');
        $rootScope.$broadcast('auth:logout');
        deferred.resolve();

        return deferred.promise;
    };

    // Initialize auth state from localStorage
    this.init = function() {
        this.checkLocalStorage();
    };

    // Format auth errors for user display
    this.formatError = function(error) {
        if (!error) return 'Unknown error occurred';

        const errorMap = {
            'Invalid email format': 'Please enter a valid email address.',
            'email is required': 'Email is required.',
            'password is required': 'Password is required.',
            'username is required': 'Username is required.',
            'first_name is required': 'First name is required.',
            'last_name is required': 'Last name is required.'
        };

        return errorMap[error.message] || error.message || 'An error occurred. Please try again.';
    };

    // Initialize auth service
    this.init();
}]);
