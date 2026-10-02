<?php
/**
 * Vinyl Room Theme functions and definitions
 */

// Защита от прямого доступа
if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

// Подключение стилей и скриптов из папки dist
function vinyl_room_enqueue_assets() {
    // Подключаем скомпилированный файл стилей из папки dist/css/
    wp_enqueue_style( 
        'vinyl-room-style', 
        get_template_directory_uri() . '/dist/css/main.min.css', 
        array(), 
        '1.0.0' 
    );

    // Подключаем основной скрипт из папки dist/js/
    wp_enqueue_script( 
        'vinyl-room-script', 
        get_template_directory_uri() . '/dist/js/main.js', 
        array(), 
        '1.0.0', 
        true 
    );

    // Подключаем скомпилированный скрипт хедера отдельно
    wp_enqueue_script( 
        'vinyl-room-header', 
        get_template_directory_uri() . '/dist/js/header.min.js', 
        array( 'jquery' ), 
        '1.0.0', 
        true 
    );
}
add_action( 'wp_enqueue_scripts', 'vinyl_room_enqueue_assets' );

// Дополнительные настройки темы (поддержка миниатюр, заголовков и т.д.)
function vinyl_room_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
}
add_action( 'after_setup_theme', 'vinyl_room_setup' );