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
        get_template_directory_uri() . '/dist/js/main.min.js', 
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

// Регистрация областей меню для админки
function vinyl_room_register_menus() {
    register_nav_menus( array(
        'primary-desktop' => __( 'Десктопное меню', 'vinyl-room' ),
        'primary-mobile'  => __( 'Мобильное меню', 'vinyl-room' ),
        'footer-browse'   => __( 'Футер: Меню BROWSE', 'vinyl-room' ),
        'footer-info'     => __( 'Футер: Меню INFO', 'vinyl-room' ),
    ) );
}
add_action( 'init', 'vinyl_room_register_menus' );
// Регистрация кастомного типа записей "Пластинки" (Records)
function vinyl_room_register_record_cpt() {
    $labels = array(
        'name'                  => __( 'Пластинки', 'vinyl-room' ),
        'singular_name'         => __( 'Пластинка', 'vinyl-room' ),
        'menu_name'             => __( 'Пластинки', 'vinyl-room' ),
        'add_new'               => __( 'Добавить новую', 'vinyl-room' ),
        'add_new_item'          => __( 'Добавить новую пластинку', 'vinyl-room' ),
        'edit_item'             => __( 'Редактировать пластинку', 'vinyl-room' ),
        'new_item'              => __( 'Новая пластинка', 'vinyl-room' ),
        'view_item'             => __( 'Просмотреть пластинку', 'vinyl-room' ),
        'search_items'          => __( 'Искать пластинку', 'vinyl-room' ),
        'not_found'             => __( 'Пластинки не найдены', 'vinyl-room' ),
        'not_found_in_trash'    => __( 'В корзине пластинок не найдено', 'vinyl-room' ),
    );

    $args = array(
        'label'                 => __( 'Пластинка', 'vinyl-room' ),
        'labels'                => $labels,
        'supports'              => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-format-audio', // Иконка ноты в админке
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,     // Включает архив (каталог)
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'rewrite'               => array( 'slug' => 'records' ), // URL будет yoursite.com/records/nazvanie-plastinki
        'show_in_rest'          => true,     // Включает поддержку Gutenberg / REST API
    );

    register_post_type( 'record', $args );
}
add_action( 'init', 'vinyl_room_register_record_cpt' );