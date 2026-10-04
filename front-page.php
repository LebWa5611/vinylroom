<?php get_header(); ?>

<main class="main-content">
    <?php
    // Подключаем секцию Hero
    get_template_part( 'template-parts/home/hero' ); 

    // Подключаем секцию Browse the Collection
    get_template_part( 'template-parts/BrowseTheCollection/vinylCollection' );

    // Подключаем секцию Editor's Pick
    get_template_part( 'template-parts/EditorPick/editorPick'); 
    ?>
</main>

<?php get_footer(); ?>