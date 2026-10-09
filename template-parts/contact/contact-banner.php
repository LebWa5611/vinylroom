<?php
/**
 * Template part for displaying the Contact Banner section
 */

// Получаем группу баннера
$banner_group = get_field('contact_banner_section');
$banner_title = $banner_group['banner_title'] ?? '';
$banner_image = $banner_group['banner_image'] ?? '';
?>

<section class="contact-banner-section">
    <div class="container">
        <!-- Нижний баннер -->
        <div class="editorial-banner">
            <?php if ($banner_title) : ?>
                <div class="editorial-banner__text">
                    <h2><?php echo esc_html($banner_title); ?></h2>
                </div>
            <?php endif; ?>

            <?php if ($banner_image) : ?>
                <div class="editorial-banner__image">
                    <img src="<?php echo esc_url($banner_image['url']); ?>" alt="<?php echo esc_attr($banner_image['alt'] ? $banner_image['alt'] : 'Crates Interior Photo'); ?>">
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>