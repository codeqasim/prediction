// ======================== LOCAL STORAGE ========================
function SET($name, $value) { localStorage.setItem($name, JSON.stringify($value)); }
function GET($name) { try { return JSON.parse(localStorage.getItem($name)); } catch { return null; } }
function DEL($name) { localStorage.removeItem($name); }

// AngularJS Application Module
angular.module('app', ['ngRoute','oc.lazyLoad']).config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
        // Enable HTML5 mode for clean URLs
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .run(['$rootScope', '$location', function($rootScope, $location) {
        // Global loading state
        $rootScope.isLoading = false;

        // Global page title and meta
        $rootScope.pageTitle = 'Predict the Future';
        $rootScope.metaDescription = 'future events and compete with others in our prediction platform';

        // Set loading function
        $rootScope.setLoading = function(state) {
            $rootScope.isLoading = state;
        };

        // Route change start
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            $rootScope.setLoading(true);

            // Check authentication for protected routes
            try {
                const AuthService = angular.element(document).injector().get('AuthService');
                if (next.requireAuth && AuthService && !AuthService.isAuthenticated()) {
                    console.log('Route requires auth but user not authenticated, redirecting to login');
                    event.preventDefault();
                    $location.path('/login');
                    $rootScope.setLoading(false);
                    return;
                }

                // Redirect authenticated users away from auth pages
                if (next.redirectIfAuth && AuthService && AuthService.isAuthenticated()) {
                    console.log('User authenticated but trying to access auth page, redirecting to dashboard');
                    event.preventDefault();
                    $location.path('/dashboard');
                    $rootScope.setLoading(false);
                    return;
                }
            } catch (error) {
                console.log('Auth check skipped - service not ready:', error.message);
            }
        });

        // Route change success
        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
            $rootScope.setLoading(false);

            // Update page title and meta
            if (current.$$route) {
                $rootScope.pageTitle = current.$$route.title || 'PredictIt - Predict the Future';
                $rootScope.metaDescription = current.$$route.meta?.description || 'Predict future events and compete with others in our prediction platform';
            }

            // Scroll to top on route change
            window.scrollTo(0, 0);
        });

        // Route change error
        $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
            console.error('Route change error:', rejection);
            $rootScope.setLoading(false);
            $location.path('/404');
        });

        // Initialize authentication check
        setTimeout(function() {
            try {
                const AuthService = angular.element(document).injector().get('AuthService');
                if (AuthService && typeof AuthService.checkLocalStorage === 'function') {
                    console.log('App.js: Initializing auth from localStorage...');
                    AuthService.checkLocalStorage();
                    console.log('App.js: Auth state after check:', AuthService.isAuthenticated());
                } else {
                    console.log('App.js: AuthService not ready yet');
                }
            } catch (error) {
                console.log('App.js: Auth initialization will happen later:', error.message);
            }
        }, 100);
    }]);
