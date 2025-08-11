// Supabase Service - Handles Supabase connection and configuration
angular.module('app').service('SupabaseService', [function() {
    let supabaseClient = null;

    // Initialize Supabase client
    this.init = function() {
        if (typeof window.supabase === 'undefined') {
            return null;
        }

        // Demo configuration for development
        if (!window.supabaseConfig) {
            window.supabaseConfig = {
                url: 'https://owoyahkmgzhnruoxghdf.supabase.co',
                anonKey: 'sb_publishable_GXGzt6hCiacsgr_udR77_g_nER3M4hH',
                demoMode: false // Add demo mode flag
            };
        }

        try {
            supabaseClient = window.supabase.createClient(
                window.supabaseConfig.url,
                window.supabaseConfig.anonKey
            );
            return supabaseClient;
        } catch (error) {
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

    // Auth methods
    this.auth = {
        // Sign up
        signUp: function(email, password, options = {}) {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.signUp({
                    email: email,
                    password: password,
                    options: options
                });
            }

            // Demo mode fallback - simulate successful registration without network calls
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    // Simulate network delay
                    setTimeout(function() {
                        // Return demo user data
                        const demoUser = {
                            id: 'demo-user-id-' + Date.now(),
                            email: email,
                            user_metadata: {
                                first_name: options.data?.first_name || 'Demo',
                                last_name: options.data?.last_name || 'User',
                                username: options.data?.username || 'demo_user'
                            }
                        };

                        resolve({
                            data: { user: demoUser },
                            error: null
                        });
                    }, 800);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Sign in
        signIn: function(email, password) {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.signInWithPassword({
                    email: email,
                    password: password
                });
            }

            // Demo mode fallback - simulate successful login without network calls
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    // Simulate network delay
                    setTimeout(function() {
                        // Return demo user data
                        const demoUser = {
                            id: 'demo-user-id',
                            email: email,
                            user_metadata: {
                                first_name: 'Demo',
                                last_name: 'User',
                                username: 'demo_user'
                            }
                        };

                        resolve({
                            data: { user: demoUser },
                            error: null
                        });
                    }, 500);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Sign out
        signOut: function() {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.signOut();
            }

            // Demo mode fallback - simulate successful logout without network calls
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve({
                            error: null
                        });
                    }, 200);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Get current session
        getSession: function() {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.getSession();
            }

            // Demo mode fallback - return null session (no user logged in initially)
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve({
                            data: { session: null },
                            error: null
                        });
                    }, 100);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Get current user
        getUser: function() {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.getUser();
            }

            // Demo mode fallback - return null user (no user logged in initially)
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve({
                            data: { user: null },
                            error: null
                        });
                    }, 100);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Reset password
        resetPassword: function(email) {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password'
                });
            }

            // Demo mode fallback - simulate successful password reset
            if (window.supabaseConfig && window.supabaseConfig.demoMode) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve({
                            data: {},
                            error: null
                        });
                    }, 300);
                });
            }

            return Promise.reject(new Error('Supabase not available'));
        }.bind(this),

        // Listen to auth changes
        onAuthStateChange: function(callback) {
            const client = this.getClient();

            // If real Supabase client is available, use it
            if (client) {
                return client.auth.onAuthStateChange(callback);
            }

            // Demo mode fallback - return null (no auth listener in demo mode)
            return null;
        }.bind(this)
    };

    // Database methods
    this.db = {
        // Select
        select: function(table, columns = '*') {
            const client = this.getClient();
            if (!client) return Promise.reject(new Error('Supabase not available'));

            return client.from(table).select(columns);
        }.bind(this),

        // Insert
        insert: function(table, data) {
            const client = this.getClient();
            if (!client) return Promise.reject(new Error('Supabase not available'));

            return client.from(table).insert(data);
        }.bind(this),

        // Update
        update: function(table, data) {
            const client = this.getClient();
            if (!client) return Promise.reject(new Error('Supabase not available'));

            return client.from(table).update(data);
        }.bind(this),

        // Delete
        delete: function(table) {
            const client = this.getClient();
            if (!client) return Promise.reject(new Error('Supabase not available'));

            return client.from(table).delete();
        }.bind(this)
    };

    // Storage Operations
    this.uploadFile = async function(bucketName, fileName, file, options = {}) {
        const supabase = this.getClient();
        if (!supabase) {
            throw new Error('Supabase client not available');
        }

        return await this.executeOperation(() =>
            supabase.storage.from(bucketName).upload(fileName, file, options)
        );
    };

    this.deleteFile = async function(bucketName, fileName) {
        const supabase = this.getClient();
        if (!supabase) {
            throw new Error('Supabase client not available');
        }

        return await this.executeOperation(() =>
            supabase.storage.from(bucketName).remove([fileName])
        );
    };

    this.getFileUrl = function(bucketName, fileName) {
        const supabase = this.getClient();
        if (!supabase) {
            console.warn('Supabase client not available, returning placeholder URL');
            return '/assets/images/default-avatar.svg';
        }

        const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        return data?.publicUrl || '/assets/images/default-avatar.svg';
    };

    this.getSignedUrl = async function(bucketName, fileName, expiresIn = 3600) {
        const supabase = this.getClient();
        if (!supabase) {
            throw new Error('Supabase client not available');
        }

        return await this.executeOperation(() =>
            supabase.storage.from(bucketName).createSignedUrl(fileName, expiresIn)
        );
    };

    this.listFiles = async function(bucketName, folder = '') {
        const supabase = this.getClient();
        if (!supabase) {
            throw new Error('Supabase client not available');
        }

        return await this.executeOperation(() =>
            supabase.storage.from(bucketName).list(folder)
        );
    };

    // Profile image specific methods
    this.uploadProfileImage = async function(userId, file) {
        const fileName = `${userId}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
        const result = await this.uploadFile('avatars', fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return {
            fileName: fileName,
            url: this.getFileUrl('avatars', fileName)
        };
    };

    this.deleteProfileImage = async function(fileName) {
        return await this.deleteFile('avatars', fileName);
    };

    this.getProfileImageUrl = function(fileName) {
        if (!fileName) return '/assets/images/default-avatar.svg';
        return this.getFileUrl('avatars', fileName);
    };

    // Initialize on service creation
    this.init();
}]);
