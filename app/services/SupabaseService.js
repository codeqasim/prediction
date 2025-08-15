// Supabase Service - Handles Supabase connection and configuration only
angular.module('app').service('SupabaseService', ['$q', function($q) {
    let supabaseClient = null;

    // Supabase Configuration - Replace with your actual credentials
    var SUPABASE_CONFIG = {
        url: 'https://cfkpfdpqobghtjewpzzd.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNma3BmZHBxb2JnaHRqZXdwenpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk5MjMsImV4cCI6MjA3MDcyNTkyM30.gkjQLw5_SlHoqjoLeLytqM6Rwp92-2a5cnwIpr0n1xw'
    };

    // Initialize Supabase client
    this.init = function() {
        if (typeof window.supabase === 'undefined') {
            console.warn('⚠️ Supabase library not loaded');
            return null;
        }

        // Validate configuration
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.error('❌ Invalid Supabase configuration: missing URL or anon key');
            return null;
        }

        try {
            console.log('🔄 Initializing Supabase client...');
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase client initialized successfully');
            return supabaseClient;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            return null;
        }
    };

    // Get Supabase client instance
    this.getClient = function() {
        if (!supabaseClient) {
            supabaseClient = this.init();
        }
        return supabaseClient;
    };

    // Check if Supabase is available
    this.isAvailable = function() {
        return supabaseClient !== null && typeof supabaseClient !== 'undefined';
    };

    // Helper function to convert native promises to Angular promises
    var toAngularPromise = function(nativePromise) {
        var deferred = $q.defer();

        nativePromise
            .then(function(result) {
                deferred.resolve(result);
            })
            .catch(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    // Auth operations - direct Supabase client access
    this.auth = {
        signUp: function(userData) {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.signUp(userData));
        }.bind(this),

        signIn: function(email, password) {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.signInWithPassword({
                email: email,
                password: password
            }));
        }.bind(this),

        signOut: function() {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.signOut());
        }.bind(this),

        getUser: function() {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.getUser());
        }.bind(this),

        getSession: function() {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.getSession());
        }.bind(this),

        onAuthStateChange: function(callback) {
            var client = this.getClient();
            if (!client) {
                console.warn('Supabase not available for auth state changes');
                return null;
            }
            return client.auth.onAuthStateChange(callback);
        }.bind(this),

        updateUser: function(userData) {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.updateUser(userData));
        }.bind(this),

        resetPasswordForEmail: function(email, options) {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.resetPasswordForEmail(email, options));
        }.bind(this),

        setSession: function(session) {
            var client = this.getClient();
            if (!client) {
                return $q.reject(new Error('Supabase not available'));
            }
            return toAngularPromise(client.auth.setSession(session));
        }.bind(this)
    };

    // Database operations - direct table access
    this.from = function(tableName) {
        var client = this.getClient();
        if (!client) {
            throw new Error('Supabase not available');
        }
        return client.from(tableName);
    };

    // Storage operations
    this.storage = {
        from: function(bucketName) {
            var client = this.getClient();
            if (!client) {
                throw new Error('Supabase not available');
            }
            return client.storage.from(bucketName);
        }.bind(this)
    };

    // Initialize on service creation
    this.init();
}]);