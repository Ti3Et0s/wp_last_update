<?php

/**
 * Plugin Name: Last Modified Plugin
 * Description: Updates the last modified time for all pages, posts, and CPTs in the site.
 * Version: 1.4
 * Author: Gal Tibet
 */

// Create a custom table for storing click timestamps
function create_click_timestamps_table()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'click_timestamps';

    // Check if the table already exists
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") === $table_name) {
        // Table already exists, check and add the columns
        $column_names = array('user_id', 'timestamp', 'updatedcount');

        foreach ($column_names as $column_name) {
            $column_exists = $wpdb->get_var("SHOW COLUMNS FROM $table_name LIKE '$column_name'");

            if (!$column_exists) {
                // Column doesn't exist, add it to the table
                $sql = "ALTER TABLE $table_name ADD COLUMN $column_name BIGINT UNSIGNED NOT NULL AFTER id;";

                // Execute the SQL query to add the column
                $result = $wpdb->query($sql);

                // Check if there were any errors during column addition
                if ($result === false) {
                    // Handle the error
                    $error_message = $wpdb->last_error;
                    // You can log the error or display a user-friendly message
                    error_log("Error adding '$column_name' column to $table_name table: $error_message");
                    // You can also display a message to the user
                    wp_die('An error occurred during plugin activation. Please contact the administrator.');
                }
            }
        }

        return; // Columns exist or have been added, no need to create the table again
    }

    // Table doesn't exist, create the table
    $sql = "CREATE TABLE $table_name (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        timestamp DATETIME NOT NULL,
        updatedcount BIGINT UNSIGNED NOT NULL
    );";

    // Include the necessary file for the dbDelta() function
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // Execute the SQL query to create the table
    $result = dbDelta($sql);

    // Check if there were any errors during table creation
    if (is_wp_error($result)) {
        // Handle the error
        $error_message = $result->get_error_message();
        // You can log the error or display a user-friendly message
        error_log("Error creating click_timestamps table: $error_message");
        // You can also display a message to the user
        wp_die('An error occurred during plugin activation. Please contact the administrator.');
    }
}

register_activation_hook(__FILE__, 'create_click_timestamps_table');




// Create a new admin menu item
function my_last_modified_plugin_menu()
{
    add_menu_page(
        'Update Last Modified Time',
        'Update Last Modified',
        'manage_options',
        'my-last-modified-plugin',
        'my_last_modified_plugin_page',
        'dashicons-update',
        99
    );
}
add_action('admin_menu', 'my_last_modified_plugin_menu');

// Callback function for the admin panel page
function my_last_modified_plugin_page()
{
    if (!current_user_can('manage_options')) {
        wp_die('You do not have sufficient permissions to access this page.');
    }

    // Generate nonces and store them in JavaScript variables
    $updateLastModifiedNonce = wp_create_nonce('update_last_modified_nonce');
    $fetchClickTimestampsNonce = wp_create_nonce('fetch_click_timestamps_nonce');
    echo '<script>var updateLastModifiedNonce = "' . $updateLastModifiedNonce . '"; var fetchClickTimestampsNonce = "' . $fetchClickTimestampsNonce . '";</script>';

    // Render the rest of the admin panel page
?>
    <div class="wrap">
        <h1>Update Last Modified Time</h1>
        <div id="my-last-modified-plugin-react"></div> <!-- Add this line -->
    </div>

    <script>
        // Your existing JavaScript code
    </script>
<?php
}

// AJAX callback to update the last modified time for all post types and store click timestamps
add_action('wp_ajax_update_last_modified', 'ajax_update_last_modified');
function ajax_update_last_modified()
{
    // Verify the AJAX request and nonce
    if (!wp_verify_nonce($_POST['nonce'], 'update_last_modified_nonce')) {
        wp_send_json_error('Invalid nonce.');
    }

    // Get all registered post types
    $post_types = get_post_types(array('public' => true), 'objects');

    // Update last modified times for each post type
    $updated_count = 0;
    $updated_counts = array();

    foreach ($post_types as $post_type) {
        $args = array(
            'post_type' => $post_type->name,
            'posts_per_page' => -1,
            'post_status' => 'publish'
        );
        $query = new WP_Query($args);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $update_result = wp_update_post(array('ID' => $post_id));

                if ($update_result !== 0 && !is_wp_error($update_result)) {
                    $updated_count++;
                    if (!isset($updated_counts[$post_type->name])) {
                        $updated_counts[$post_type->name] = 1;
                    } else {
                        $updated_counts[$post_type->name]++;
                    }
                }
            }
        }
        wp_reset_postdata();
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'click_timestamps';

    // Insert the current timestamp and updated count into the custom table
    $current_timestamp = current_time('mysql');
    $user_id = get_current_user_id(); // Get the current user ID

    // Insert a new row with the user ID, timestamp, and updated count
    $wpdb->insert($table_name, array('user_id' => $user_id, 'timestamp' => $current_timestamp, 'updatedcount' => $updated_count));

    if ($updated_count > 0) {
        $response = array(
            'success' => true,
            'updatedCount' => $updated_count,
            'message' => "Last modified times have been updated for {$updated_count} item(s).",
            'timestamp' => $current_timestamp
        );
        if (!empty($updated_counts)) {
            $response['updatedCounts'] = $updated_counts;
        }
        wp_send_json_success($response);
    } else {
        wp_send_json_error('Error updating last modified times.');
    }
}



// AJAX callback to fetch click timestamps
add_action('wp_ajax_fetch_click_timestamps', 'ajax_fetch_click_timestamps');
function ajax_fetch_click_timestamps()
{
    // Verify the AJAX request and nonce
    if (!wp_verify_nonce($_POST['nonce'], 'fetch_click_timestamps_nonce')) {
        wp_send_json_error('Invalid nonce.');
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'click_timestamps';

    // Fetch all click timestamps from the custom table
    $timestamps = $wpdb->get_results("SELECT * FROM $table_name ORDER BY timestamp DESC");

    // Get user names based on user IDs
    foreach ($timestamps as $timestamp) {
        $user_id = $timestamp->user_id;
        $user = get_user_by('id', $user_id);
        $user_name = $user ? $user->display_name : 'Unknown';
        $timestamp->user_name = $user_name;
    }

    wp_send_json_success($timestamps);
}

// Enqueue the bundled JavaScript file
function my_last_modified_plugin_enqueue_scripts()
{
    // Enqueue bundled JavaScript file
    wp_enqueue_script(
        'my-last-modified-plugin-react',
        plugin_dir_url(__FILE__) . 'dist/bundle.js',
        array('jquery'),
        '1.0',
        true
    );
    // Localize the script before enqueuing
    wp_localize_script('my-last-modified-plugin-react', 'myAjax', array('ajaxurl' => admin_url('admin-ajax.php')));
}
add_action('admin_enqueue_scripts', 'my_last_modified_plugin_enqueue_scripts');
