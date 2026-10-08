<?php
/**
 * Template part for displaying the Browse the Collection section
 */
?>

<section class="browse-collection">
    <div class="container">
        <div class="browse-collection__header">
            <span class="browse-collection__number">01</span>
            <h2 class="browse-collection__title">Browse the Collection</h2>
        </div>

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
            <!-- Карточка 1 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (1).png" alt="Midnight Architecture">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Midnight Architecture</h3>
                    <p class="record-card__artist">Koda Sato</p>
                    <div class="record-card__meta">
                        <span class="tag">Electronic</span>
                        <span class="year">2024</span>
                    </div>
                    <span class="record-card__price">€34.00</span>
                </div>
            </a>

            <!-- Карточка 2 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (2).png" alt="The Long Way Round">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">The Long Way Round</h3>
                    <p class="record-card__artist">The Wrecking Light</p>
                    <div class="record-card__meta">
                        <span class="tag">Rock</span>
                        <span class="year">2023</span>
                    </div>
                    <span class="record-card__price">€29.00</span>
                </div>
            </a>

            <!-- Карточка 3 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (3).png" alt="Blue Conversations">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Blue Conversations</h3>
                    <p class="record-card__artist">Mara Jennings Trio</p>
                    <div class="record-card__meta">
                        <span class="tag">Jazz</span>
                        <span class="year">2024</span>
                    </div>
                    <span class="record-card__price">€32.00</span>
                </div>
            </a>

            <!-- Карточка 4 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (4).png" alt="Concrete Garden">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Concrete Garden</h3>
                    <p class="record-card__artist">Dusk Protocol</p>
                    <div class="record-card__meta">
                        <span class="tag">Electronic</span>
                        <span class="year">2023</span>
                    </div>
                    <span class="record-card__price">€36.00</span>
                </div>
            </a>

            <!-- Карточка 5 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (5).png" alt="Borrowed Time">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Borrowed Time</h3>
                    <p class="record-card__artist">Samuel Cross</p>
                    <div class="record-card__meta">
                        <span class="tag">Rock</span>
                        <span class="year">2022</span>
                    </div>
                    <span class="record-card__price">€28.00</span>
                </div>
            </a>

            <!-- Карточка 6 -->
            <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork.png" alt="Night Standard">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Night Standard</h3>
                    <p class="record-card__artist">Aiko Tanaka Quartet</p>
                    <div class="record-card__meta">
                        <span class="tag">Jazz</span>
                        <span class="year">2024</span>
                    </div>
                    <span class="record-card__price">€31.00</span>
                </div>
            </a>
        </div>

        <div class="browse-collection__load-more">
            <button class="btn-load-more">Load More</button>
        </div>
    </div>
</section>