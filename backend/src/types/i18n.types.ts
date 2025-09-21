export interface TranslationKeys {
  // Authentication messages
  auth: {
    registration_success: string;
    login_success: string;
    logout_success: string;
    invalid_credentials: string;
    registration_failed: string;
    login_failed: string;
    logout_failed: string;
    token_refresh_failed: string;
    token_refresh_success: string;
    authentication_required: string;
    authentication_failed: string;
    not_implemented: string;
  };

  // User management messages
  user: {
    profile_retrieved: string;
    profile_updated: string;
    profile_update_failed: string;
    account_deleted: string;
    account_deletion_failed: string;
    user_not_found: string;
    users_retrieved: string;
    users_retrieval_failed: string;
  };

  // Validation messages
  validation: {
    email_required: string;
    email_invalid: string;
    email_already_exists: string;
    password_required: string;
    password_min_length: string;
    name_required: string;
    validation_failed: string;
    validation_error: string;
  };

  // Authorization messages
  authorization: {
    insufficient_permissions: string;
    admin_access_required: string;
    authorization_error: string;
  };

  // Server messages
  server: {
    routes_initialized: string;
    routes_initialization_failed: string;
    server_starting: string;
    graceful_shutdown: string;
    internal_server_error: string;
    route_not_found: string;
  };

  // Database messages
  database: {
    connection_failed: string;
    transaction_failed: string;
    query_failed: string;
  };

  // Audit messages
  audit: {
    user_registered: string;
    user_logged_in: string;
    user_logged_out: string;
    profile_updated: string;
    account_deleted: string;
    admin_accessed_users: string;
    admin_accessed_user: string;
  };

  // Error messages
  errors: {
    unknown_error: string;
    method_not_implemented: string;
    operation_failed: string;
  };
}
