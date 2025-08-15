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
            // if (next.requireAuth && !AuthService.isAuthenticated()) {
            //     event.preventDefault();
            //     $location.path('/login');
            //     $rootScope.setLoading(false);
            //     return;
            // }

            // // Redirect authenticated users away from auth pages
            // if (next.redirectIfAuth && AuthService.isAuthenticated()) {
            //     event.preventDefault();
            //     $location.path('/');
            //     $rootScope.setLoading(false);
            //     return;
            // }
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
        // AuthService.checkExistingAuth();
    }]);
