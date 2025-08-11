// AngularJS Routes Configuration
angular.module('app').config(['$routeProvider', function($routeProvider) {
    $routeProvider
        // Home Route
        .when('/', {
            templateUrl: 'app/views/home/index.html',
            controller: '',
            controllerAs: 'home',
            title: 'Predict the Future',
            meta: {
                description: 'Join thousands of users in predicting future events. Test your prediction skills and compete on our leaderboard.',
                keywords: 'prediction, future, events, competition, leaderboard'
            }
        })

        // Authentication Routes
        .when('/login', {
            templateUrl: 'app/views/auth/login.html',
            controller: 'AuthController',
            controllerAs: 'auth',
            title: 'Login',
            redirectIfAuth: true,
            meta: {
                description: 'Sign in to your PredictIt account to start making predictions and competing with others.',
                keywords: 'login, sign in, authentication, predict'
            }
        })

        .when('/register', {
            templateUrl: 'app/views/auth/register.html',
            controller: 'AuthController',
            controllerAs: 'auth',
            title: 'Create Account - PredictIt',
            redirectIfAuth: true,
            meta: {
                description: 'Create your free PredictIt account and start predicting future events today.',
                keywords: 'register, sign up, create account, join'
            }
        })

        .when('/forgot-password', {
            templateUrl: 'app/views/auth/forgot-password.html',
            controller: 'AuthController',
            controllerAs: 'auth',
            title: 'Reset Password - PredictIt',
            redirectIfAuth: true,
            meta: {
                description: 'Reset your PredictIt account password.',
                keywords: 'forgot password, reset password, recovery'
            }
        })

        // Leaderboard Route
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

        // Profile Route (Protected)
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

        // Dashboard Route (Protected)
        .when('/dashboard', {
            templateUrl: 'app/views/auth/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'dashboard',
            title: 'Dashboard',
            requireAuth: true,
            meta: {
                description: 'Your personal prediction dashboard with stats and active predictions.',
                keywords: 'dashboard, stats, predictions, personal'
            }
        })

        // Predictions Routes
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

        // About Route
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

        // 404 Error Route
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
