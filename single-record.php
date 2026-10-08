<?php 
/**
 * Template Name: Single Record Template
 * Description: Шаблон для детальной страницы пластинки (Custom Post Type / Single)
 */

get_header(); ?>

<main class="main-content">
    <?php
    // 1. Подключаем разделенные блоки детальной страницы пластинки
    get_template_part( 'template-parts/record-detail/voltage-hero' );
    get_template_part( 'template-parts/record-detail/voltage-description' );
    get_template_part( 'template-parts/record-detail/voltage-tracklist' );

    // 2. Подключаем секцию связанных записей (похожие пластинки)
    get_template_part( 'template-parts/record-detail/related-records' );
    ?>
</main>

<?php get_footer(); ?>