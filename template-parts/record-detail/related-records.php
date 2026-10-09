<?php
/**
 * Template part for displaying the Related Records section
 */

$related_sec = get_field('related_section');

$sec_number = $related_sec['section_number'] ?? '';
$sec_title  = $related_sec['section_title'] ?? '';
$cards      = $related_sec['related_cards'] ?? [];
$browse_link = $related_sec['browse_link'] ?? '';
$browse_text = $related_sec['browse_text'] ?? '';
?>

<?php if (!empty($cards) || $sec_title): ?>
<section class="related-records">
    <div class="container">
        
        <!-- Заголовок секции -->
        <?php if ($sec_title || $sec_number): ?>
            <div class="related-records__header">
                <?php if ($sec_number): ?>
                    <span class="related-records__number"><?php echo esc_html($sec_number); ?></span>
                <?php endif; ?>
                <?php if ($sec_title): ?>
                    <h2 class="related-records__title"><?php echo esc_html($sec_title); ?></h2>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- Сетка карточек -->
        <?php if (!empty($cards)): ?>
            <div class="related-records__grid">
                <?php foreach ($cards as $card): ?>
                    <?php 
                        $link   = $card['card_link'] ?? '#';
                        $image  = $card['card_image'] ?? '';
                        $title  = $card['card_title'] ?? '';
                        $artist = $card['card_artist'] ?? '';
                        $genre  = $card['card_genre'] ?? '';
                        $year   = $card['card_year'] ?? '';
                        $price  = $card['card_price'] ?? '';
                    ?>
                    <a href="<?php echo esc_url($link); ?>" class="record-card">
                        <?php if ($image): ?>
                            <div class="record-card__image-wrap">
                                <?php if (is_array($image)): ?>
                                    <img src="<?php echo esc_url($image['url']); ?>" alt="<?php echo esc_attr($title); ?>" class="record-card__img">
                                <?php else: ?>
                                    <img src="<?php echo esc_url(wp_get_attachment_image_url($image, 'full')); ?>" alt="<?php echo esc_attr($title); ?>" class="record-card__img">
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <div class="record-card__content">
                            <?php if ($title): ?>
                                <h3 class="record-card__title"><?php echo esc_html($title); ?></h3>
                            <?php endif; ?>

                            <?php if ($artist): ?>
                                <p class="record-card__artist"><?php echo esc_html($artist); ?></p>
                            <?php endif; ?>

                            <?php if ($genre || $year): ?>
                                <div class="record-card__meta">
                                    <?php if ($genre): ?>
                                        <span class="tag"><?php echo esc_html($genre); ?></span>
                                    <?php endif; ?>
                                    <?php if ($year): ?>
                                        <span class="year"><?php echo esc_html($year); ?></span>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($price): ?>
                                <span class="record-card__price"><?php echo esc_html($price); ?></span>
                            <?php endif; ?>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Кнопка «Browse More Records» -->
        <?php if ($browse_link && $browse_text): ?>
            <div class="related-records__action">
                <a href="<?php echo esc_url($browse_link); ?>" class="btn-outline-wide"><?php echo esc_html($browse_text); ?></a>
            </div>
        <?php endif; ?>

    </div>
</section>
<?php endif; ?>