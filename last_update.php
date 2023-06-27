<?php
/**
 * Plugin Name: My Last Modified Plugin
 * Description: Updates the last modified time for all pages, posts, and CPTs in the site.
 * Version: 1.3
 * Author: Gal Tibet
 */

// Create a new admin menu item
function my_last_modified_plugin_menu() {
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
function my_last_modified_plugin_page() {
    if (!current_user_can('manage_options')) {
        wp_die('You do not have sufficient permissions to access this page.');
    }

    // Render the admin panel page
    ?>
    <div class="wrap">
        <h1>Update Last Modified Time</h1>
        <p>Click the button below to update the last modified time for all pages, posts, and CPTs in the site.</p>
        <p><button id="update-last-modified" class="button-primary">Update Last Modified</button></p>
        <div id="update-message"></div>
    </div>

    <script>
        jQuery(document).ready(function($) {
            $('#update-last-modified').click(function() {
                $('#update-last-modified').attr('disabled', 'disabled');
                $('#update-message').html('Updating last modified times...');

                // Send AJAX request to update last modified times
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'update_last_modified',
                        nonce: '<?php echo wp_create_nonce("update_last_modified_nonce"); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            $('#update-message').html('<div class="updated"><p>' + response.message + '</p></div>');
                        } else {
                            $('#update-message').html('<div class="error"><p>' + response.message + '</p></div>');
                        }
                        $('#update-last-modified').removeAttr('disabled');
                    },
                    error: function() {
                        $('#update-message').html('<div class="error"><p>Error updating last modified times.</p></div>');
                        $('#update-last-modified').removeAttr('disabled');
                    }
                });
            });
        });
    </script>
    <?php
}

// AJAX callback to update the last modified time for all post types
add_action('wp_ajax_update_last_modified', 'ajax_update_last_modified');
function ajax_update_last_modified() {
    // Verify the AJAX request and nonce
    if (!wp_verify_nonce($_POST['nonce'], 'update_last_modified_nonce')) {
        wp_send_json_error('Invalid nonce.');
    }

    // Get all registered post types
    $post_types = get_post_types(array('public' => true), 'objects');

    // Update last modified times for each post type
    $updated_count = 0;
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
                }
            }
        }
        wp_reset_postdata();
    }

    if ($updated_count > 0) {
        wp_send_json_success("Last modified times have been updated for {$updated_count} post(s).");
    } else {
        wp_send_json_error('Error updating last modified times.');
    }
}
