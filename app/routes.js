// AngularJS Routes Configuration
angular.module('app').config(['$routeProvider', function($routeProvider) { $routeProvider

        // ========================================= HOME
        .when('/admin', {
            templateUrl: 'app/views/admin/index.html',
            controller: 'AdminController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/AdminController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        pageTitle: 'Admin Dashboard',
        role: '',
        })







        // ========================================= HOME
        .when('/', {
            templateUrl: 'app/views/home/index.html',
            controller: 'HomeController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/HomeController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        pageTitle: 'Predict the Future',
        role: '',
        })

        // ========================================= Public Profile
        .when('/u/:username', {
            templateUrl: '/app/views/auth/public-profile.html',
            controller: 'PublicProfileController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        '/app/controllers/auth/PublicProfileController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        pageTitle: 'User Profile',
        role: '',
        })

        // ========================================= Dashboard
        .when('/dashboard', {
            templateUrl: 'app/views/auth/dashboard.html',
            controller: 'DashboardController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/auth/DashboardController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false, // Temporarily set to false to show static data
        pageTitle: 'Dashboard',
        role: '',
        })

        // ========================================= Login
        .when('/login', {
            templateUrl: 'app/views/auth/login.html',
            controller: 'LoginController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/auth/LoginController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        redirectIfAuth: true,
        pageTitle: 'Login',
        role: '',
        })

        // ========================================= Signup
        .when('/signup', {
            templateUrl: 'app/views/auth/signup.html',
            controller: 'SignupController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/auth/SignupController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        redirectIfAuth: true,
        pageTitle: 'Signup',
        role: '',
        })

        // ========================================= Forgot Password
        .when('/forgot-password', {
            templateUrl: 'app/views/auth/forgot-password.html',
            controller: 'ForgotPasswordController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/auth/ForgotPasswordController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        pageTitle: 'Forgot Password',
        role: '',
        })

        // ========================================= Password Reset
        .when('/password-reset', {
            templateUrl: 'app/views/auth/password-reset.html',
            controller: 'PasswordResetController',
            resolve: {
                load: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'app/controllers/auth/PasswordResetController.js',
                    ]);
                }]
            },
        showHeader: true,
        showFooter: true,
        requireAuth: false,
        pageTitle: 'Reset Password',
        role: '',
        })

        // ========================================= Profile (Protected)
        .when('/profile', {
            templateUrl: 'app/views/auth/profile.html',
            controller: 'ProfileController',
            controllerAs: 'profile',
            title: 'My Profile',
            requireAuth: true,
            meta: {
                description: 'Manage your PredictIt and view your prediction history.',
                keywords: 'profile, settings, history, account'
            }
        })

        // ========================================= Leaderboard Route
        .when('/leaderboard', {
            templateUrl: 'app/views/leaderboard/index.html',
            controller: 'LeaderboardController',
            controllerAs: 'leaderboard',
            title: 'Leaderboard - PredictIt',
            meta: {
                description: 'View the top prediction leaders and see how you rank against other users.',
                keywords: 'leaderboard, rankings, top users, competition'
            }
        })

        // ========================================= Predictions Routes
        .when('/predictions', {
            templateUrl: 'app/views/predictions/index.html',
            controller: 'PredictionsController',
            controllerAs: 'predictions',
            title: 'All Predictions - PredictIt',
            meta: {
                description: 'Browse all available predictions and make your choices.',
                keywords: 'predictions, events, browse, participate'
            }
        })

        .when('/predictions/:id', {
            templateUrl: 'app/views/predictions/detail.html',
            controller: 'PredictionDetailController',
            controllerAs: 'detail',
            title: 'Prediction Details - PredictIt',
            meta: {
                description: 'View detailed information about this prediction and make your choice.',
                keywords: 'prediction detail, participate, vote'
            }
        })

        // ========================================= About Route
        .when('/about', {
            templateUrl: 'app/views/about/index.html',
            controller: 'AboutController',
            controllerAs: 'about',
            title: 'About - PredictIt',
            meta: {
                description: 'Learn more about PredictIt and how our prediction platform works.',
                keywords: 'about, how it works, information, platform'
            }
        })

        // ========================================= 404 Error Route
        .when('/404', {
            templateUrl: 'app/views/errors/404.html',
            controller: 'ErrorController',
            controllerAs: 'error',
            title: 'Page Not Found - PredictIt',
            meta: {
                description: 'The page you are looking for could not be found.',
                keywords: '404, not found, error'
            }
        })

        // Catch all - redirect to 404
        .otherwise({
            redirectTo: '/404'
        });
}]);
