<?php
/**
 * Template part for displaying the Contact Hero section
 */

// Получаем группу полей из ACF
$contact_hero = get_field('contact_hero_section');

// Безопасно извлекаем поля, если они заполнены
$title = ( $contact_hero && !empty($contact_hero['title']) ) ? $contact_hero['title'] : '';
$desc  = ( $contact_hero && !empty($contact_hero['description']) ) ? $contact_hero['description'] : '';
$image = ( $contact_hero && !empty($contact_hero['image']) ) ? $contact_hero['image'] : '';
?>

<section class="contact-page">
    <div class="container">
        <!-- Герой-секция контактов -->
        <div class="contact-hero">
            <div class="contact-hero__text">
                <?php if ( $title ): ?>
                    <h1 class="contact-hero__title"><?php echo esc_html( $title ); ?></h1>
                <?php endif; ?>

                <?php if ( $desc ): ?>
                    <p class="contact-hero__desc"><?php echo esc_html( $desc ); ?></p>
                <?php endif; ?>
            </div>

            <div class="contact-hero__image">
                <?php if ( $image ): ?>
                    <?php 
                        $img_url = is_array($image) ? $image['url'] : wp_get_attachment_image_url($image, 'full'); 
                    ?>
                    <img src="<?php echo esc_url( $img_url ); ?>" alt="Sound Spectrum Interior">
                <?php else: ?>
                    <!-- Картинка по умолчанию, пока в ACF ничего не загружено -->
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Hero Visual Frame (1).png'); ?>" alt="Sound Spectrum Interior">
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>