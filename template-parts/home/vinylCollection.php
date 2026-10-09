<?php
/**
 * Template part for displaying the Browse the Collection section
 */

// Получаем группу полей из ACF
$collection = get_field('vinyl_collection');

if ( $collection ):
    $section_title = isset($collection['browse_title']) ? $collection['browse_title'] : 'Browse the Collection';
    $records       = isset($collection['records_list']) ? $collection['records_list'] : array();
?>

<section class="browse-collection">
    <div class="container">
        <div class="browse-collection__header">
            <span class="browse-collection__number">01</span>
            <h2 class="browse-collection__title"><?php echo esc_html( $section_title ); ?></h2>
        </div>

        <!-- Пока оставляем статичными для будущей логики поиска и фильтрации -->
        <div class="browse-collection__search-wrap">
            <input type="text" class="browse-collection__search" placeholder="Search by album or artist...">
        </div>

        <div class="browse-collection__filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="rock">Rock</button>
            <button class="filter-btn" data-filter="jazz">Jazz</button>
            <button class="filter-btn" data-filter="electronic">Electronic</button>
            <button class="filter-btn" data-filter="hip-hop">Hip-Hop</button>
        </div>

        <div class="browse-collection__grid">
            <?php 
            if ( ! empty( $records ) ): 
                foreach ( $records as $record ):
                    // Извлекаем поля карточки
                    $image  = isset($record['record_image']) ? $record['record_image'] : '';
                    $title  = isset($record['record_title']) ? $record['record_title'] : '';
                    $artist = isset($record['record_artist']) ? $record['record_artist'] : '';
                    $genre  = isset($record['record_genre']) ? $record['record_genre'] : '';
                    $year   = isset($record['record_year']) ? $record['record_year'] : '';
                    $price  = isset($record['record_price']) ? $record['record_price'] : '';
                    $link   = isset($record['record_link']) ? $record['record_link'] : home_url( '/record-detail/' );
            ?>
                <a href="<?php echo esc_url( $link ); ?>" class="record-card">
                    <div class="record-card__image-wrap">
                        <?php if ( $image ): ?>
                            <!-- Если в ACF выбрано возвращать массив изображения, берем URL, если ID — wp_get_attachment_image_url -->
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
                                <span class="tag"><?php echo esc_html( $genre ); ?></span>
                            <?php endif; ?>
                            <?php if ( $year ): ?>
                                <span class="year"><?php echo esc_html( $year ); ?></span>
                            <?php endif; ?>
                        </div>

                        <?php if ( $price ): ?>
                            <span class="record-card__price"><?php echo esc_html( $price ); ?></span>
                        <?php endif; ?>
                    </div>
                </a>
            <?php 
                endforeach; 
            endif; 
            ?>
        </div>

        <div class="browse-collection__load-more">
            <button class="btn-load-more">Load More</button>
        </div>
    </div>
</section>

<?php endif; ?>