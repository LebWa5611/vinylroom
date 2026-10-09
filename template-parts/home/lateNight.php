<?php
/**
 * Template part for displaying the Late Night Listening section
 */

// Получаем группу полей Late Night из ACF
$late_night = get_field('late_night_section');

if ( $late_night ):
    $label   = isset($late_night['section_label']) ? $late_night['section_label'] : 'LATE NIGHT LISTENING';
    $desc    = isset($late_night['section_desc']) ? $late_night['section_desc'] : 'Three records for when the city quiets down.';
    $records = isset($late_night['night_records_list']) ? $late_night['night_records_list'] : array();
?>

<section class="late-night">
    <div class="container">
        <div class="late-night__header">
            <div class="late-night__subtitle-row">
                <span class="late-night__number">03</span>
                <span class="late-night__label"><?php echo esc_html( $label ); ?></span>
            </div>
            <?php if ( $desc ): ?>
                <p class="late-night__desc"><?php echo esc_html( $desc ); ?></p>
            <?php endif; ?>
        </div>

        <div class="late-night__grid">
            <?php 
            if ( ! empty( $records ) ): 
                foreach ( $records as $record ):
                    $image  = isset($record['record_image']) ? $record['record_image'] : '';
                    $title  = isset($record['record_title']) ? $record['record_title'] : '';
                    $artist = isset($record['record_artist']) ? $record['record_artist'] : '';
                    $genre  = isset($record['record_genre']) ? $record['record_genre'] : '';
                    $year   = isset($record['record_year']) ? $record['record_year'] : '';
                    $price  = isset($record['record_price']) ? $record['record_price'] : '';
                    $link   = isset($record['record_link']) ? $record['record_link'] : home_url( '/record-detail/' );
            ?>
                <a href="<?php echo esc_url( $link ); ?>" class="record-card">
                    <div class="record-card__image">
                        <?php if ( $image ): ?>
                            <?php 
                                $img_url = is_array($image) ? $image['url'] : wp_get_attachment_image_url($image, 'full'); 
                            ?>
                            <img src="<?php echo esc_url( $img_url ); ?>" alt="<?php echo esc_attr( $title ); ?>">
                        <?php endif; ?>
                    </div>
                    <div class="record-card__content">
                        <?php if ( $title ): ?>
                            <h3 class="record-card__title"><?php echo esc_html( $title ); ?></h3>
                        <?php endif; ?>

                        <?php if ( $artist ): ?>
                            <p class="record-card__artist"><?php echo esc_html( $artist ); ?></p>
                        <?php endif; ?>

                        <div class="record-card__meta">
                            <?php if ( $genre ): ?>
                                <span class="record-card__tag"><?php echo esc_html( $genre ); ?></span>
                            <?php endif; ?>
                            <?php if ( $year ): ?>
                                <span class="record-card__year"><?php echo esc_html( $year ); ?></span>
                            <?php endif; ?>
                        </div>

                        <?php if ( $price ): ?>
                            <div class="record-card__price"><?php echo esc_html( $price ); ?></div>
                        <?php endif; ?>
                    </div>
                </a>
            <?php 
                endforeach; 
            endif; 
            ?>
        </div>
    </div>
</section>

<?php endif; ?>