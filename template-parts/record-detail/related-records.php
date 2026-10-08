<section class="related-records">
    <div class="container">
        
        <!-- Заголовок секции -->
        <div class="related-records__header">
            <span class="related-records__number">01</span>
            <h2 class="related-records__title">MORE FROM THE COLLECTION</h2>
        </div>

        <!-- Сетка карточек (3 штуки) -->
        <div class="related-records__grid">
            
            <!-- Карточка 1 -->
            <a href="<?php echo esc_url(home_url('/record-detail/')); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Album Artwork (9).png'); ?>" alt="Midnight Architecture" class="record-card__img">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Midnight Architecture</h3>
                    <p class="record-card__artist">Koda Sato</p>
                    <div class="record-card__meta">
                        <span class="tag">ELECTRONIC</span>
                        <span class="year">2024</span>
                    </div>
                    <span class="record-card__price">€34.00</span>
                </div>
            </a>

            <!-- Карточка 2 -->
            <a href="<?php echo esc_url(home_url('/record-detail/')); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Album Artwork (10).png'); ?>" alt="Blue Conversations" class="record-card__img">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Blue Conversations</h3>
                    <p class="record-card__artist">Mara Jennings Trio</p>
                    <div class="record-card__meta">
                        <span class="tag">JAZZ</span>
                        <span class="year">2024</span>
                    </div>
                    <span class="record-card__price">€32.00</span>
                </div>
            </a>

            <!-- Карточка 3 -->
            <a href="<?php echo esc_url(home_url('/record-detail/')); ?>" class="record-card">
                <div class="record-card__image-wrap">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Album Artwork (11).png'); ?>" alt="Concrete Garden" class="record-card__img">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Concrete Garden</h3>
                    <p class="record-card__artist">Dusk Protocol</p>
                    <div class="record-card__meta">
                        <span class="tag">ELECTRONIC</span>
                        <span class="year">2023</span>
                    </div>
                    <span class="record-card__price">€36.00</span>
                </div>
            </a>

        </div>

        <!-- Кнопка «Browse More Records» -->
        <div class="related-records__action">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="btn-outline-wide">BROWSE MORE RECORDS</a>
        </div>

    </div>
</section>