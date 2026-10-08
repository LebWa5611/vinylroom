<?php 
/**
 * Template Name: Front Page
 */

get_header(); 
?>

<main class="main-content">
    <?php
    // 1. Секция Hero
    get_template_part( 'template-parts/home/hero' ); 

    // 2. Секция Browse the Collection
    get_template_part( 'template-parts/home/vinylCollection' );

    // 3. Секция Editor's Pick
    get_template_part( 'template-parts/home/editorPick' ); 

    // 4. Секция Selected for Listening
    get_template_part( 'template-parts/home/selected' );

    // 5. Секция Late Night Listening
    get_template_part( 'template-parts/home/lateNight' );
    ?>
</main>

<?php get_footer(); ?>