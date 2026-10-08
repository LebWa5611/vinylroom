<?php get_header(); ?>

<main class="main-content">
    <?php
    // Подключаем секцию Hero
    get_template_part( 'template-parts/home/hero' ); 

    // Подключаем секцию Browse the Collection
    get_template_part( 'template-parts/BrowseTheCollection/vinylCollection' );

    // Подключаем секцию Editor's Pick
    get_template_part( 'template-parts/EditorPick/editorPick'); 

    // Подключаем секцию Selected for Listening
    get_template_part( 'template-parts/SelectedListening/Selected' );

    // Подключаем секцию Late Night Listening
    get_template_part( 'template-parts/LateNight/lateNight' );

    // Подключаем секцию Related Records
    get_template_part('template-parts/related-records/related-records');
    ?>
</main>

<?php get_footer(); ?>