<?php get_header(); ?>

<main class="main-content">
    <?php 
    // Подключаем секцию Hero из папки template-parts/home/hero.php
    get_template_part( 'template-parts/home/hero' ); 
    ?>
</main>

<?php get_footer(); ?>