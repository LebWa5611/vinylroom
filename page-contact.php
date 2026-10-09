<?php
/**
 * Template Name: Contact Page
 * Description: Шаблон для страницы контактов
 */

get_header(); ?>

<main class="main-content">
    <?php
    get_template_part( 'template-parts/contact/contact-hero' );
    get_template_part( 'template-parts/contact/contact-main' );
    get_template_part( 'template-parts/contact/contact-banner' );
    ?>
</main>

<?php get_footer(); ?>