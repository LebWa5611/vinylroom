<?php
/**
 * Template part for displaying the Voltage Hero section
 */

// Получаем группу полей целиком
$hero = get_field('hero_section');

// Если группа не заполнена, переменные будут пустыми
$genre        = $hero['hero_genre'] ?? '';
$title        = $hero['hero_title'] ?? '';
$artist       = $hero['hero_artist'] ?? '';
$price        = $hero['hero_price'] ?? '';
$cover_image  = $hero['hero_cover_image'] ?? '';

$meta_artist   = $hero['meta_artist'] ?? '';
$meta_genre    = $hero['meta_genre'] ?? '';
$meta_released = $hero['meta_released'] ?? '';
$meta_label    = $hero['meta_label'] ?? '';
$meta_format   = $hero['meta_format'] ?? '';
$meta_pressing = $hero['meta_pressing'] ?? '';

$inquire_link  = $hero['inquire_link'] ?? '';
$inquire_text  = $hero['inquire_text'] ?? '';
?>

<?php if ($title || $cover_image): ?>
<section class="record-detail">
    <div class="container">
        <!-- Кнопка назад -->
        <div class="record-detail__back">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="back-link">
                <span>←</span> BACK TO RECORDS
            </a>
        </div>

        <!-- Основной контент карточки (две колонки) -->
        <div class="record-detail__grid">
            <!-- Левая колонка: Обложка -->
            <?php if ($cover_image): ?>
                <div class="record-detail__media">
                    <div class="record-detail__image-wrap">
                        <?php if (is_array($cover_image)): ?>
                            <img src="<?php echo esc_url($cover_image['url']); ?>" alt="<?php echo esc_attr($title); ?>" class="record-detail__img">
                        <?php else: ?>
                            <img src="<?php echo esc_url(wp_get_attachment_image_url($cover_image, 'full')); ?>" alt="<?php echo esc_attr($title); ?>" class="record-detail__img">
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Правая колонка: Информация -->
            <div class="record-detail__info">
                <?php if ($genre): ?>
                    <div class="record-detail__tag"><?php echo esc_html($genre); ?></div>
                <?php endif; ?>
                
                <?php if ($title): ?>
                    <h1 class="record-detail__title"><?php echo esc_html($title); ?></h1>
                <?php endif; ?>

                <?php if ($artist): ?>
                    <p class="record-detail__artist-subtitle"><?php echo esc_html($artist); ?></p>
                <?php endif; ?>
                
                <?php if ($price): ?>
                    <div class="record-detail__price"><?php echo esc_html($price); ?></div>
                <?php endif; ?>

                <!-- Мета-данные сеткой 3x2 -->
                <?php if ($meta_artist || $meta_genre || $meta_released || $meta_label || $meta_format || $meta_pressing): ?>
                    <div class="record-detail__meta-grid">
                        <?php if ($meta_artist): ?>
                            <div class="meta-item">
                                <span class="meta-label">ARTIST</span>
                                <span class="meta-value"><?php echo esc_html($meta_artist); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if ($meta_genre): ?>
                            <div class="meta-item">
                                <span class="meta-label">GENRE</span>
                                <span class="meta-value"><?php echo esc_html($meta_genre); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if ($meta_released): ?>
                            <div class="meta-item">
                                <span class="meta-label">RELEASED</span>
                                <span class="meta-value"><?php echo esc_html($meta_released); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if ($meta_label): ?>
                            <div class="meta-item">
                                <span class="meta-label">LABEL</span>
                                <span class="meta-value"><?php echo esc_html($meta_label); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if ($meta_format): ?>
                            <div class="meta-item">
                                <span class="meta-label">FORMAT</span>
                                <span class="meta-value"><?php echo esc_html($meta_format); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if ($meta_pressing): ?>
                            <div class="meta-item">
                                <span class="meta-label">PRESSING</span>
                                <span class="meta-value"><?php echo esc_html($meta_pressing); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <!-- Кнопка заказа / запроса -->
                <?php if ($inquire_link && $inquire_text): ?>
                    <div class="record-detail__action">
                        <a href="<?php echo esc_url($inquire_link); ?>" class="btn btn-accent"><?php echo esc_html($inquire_text); ?></a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>