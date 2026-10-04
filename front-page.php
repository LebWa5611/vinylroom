<?php get_header(); ?>

<main class="main-content">
    <?php
    // Подключаем секцию Hero
    get_template_part( 'template-parts/home/hero' ); 

    // Подключаем новую секцию Browse the Collection
    get_template_part( 'template-parts/BrowseTheCollection/vinylCollection' );
    ?>
</main>

<?php get_footer(); ?>