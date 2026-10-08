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
            <div class="record-detail__media">
                <div class="record-detail__image-wrap">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/src/images/Artwork Outer Frame.png'); ?>" alt="Slow Voltage" class="record-detail__img">
                </div>
            </div>

            <!-- Правая колонка: Информация -->
            <div class="record-detail__info">
                <div class="record-detail__tag">ROCK</div>
                
                <h1 class="record-detail__title">Slow Voltage</h1>
                <p class="record-detail__artist-subtitle">The Wrecking Light</p>
                
                <div class="record-detail__price">€34.00</div>

                <!-- Мета-данные сеткой 3x2 -->
                <div class="record-detail__meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">ARTIST</span>
                        <span class="meta-value">The Wrecking Light</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">GENRE</span>
                        <span class="meta-value">Rock</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">RELEASED</span>
                        <span class="meta-value">2024</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">LABEL</span>
                        <span class="meta-value">Independent</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">FORMAT</span>
                        <span class="meta-value">180g Vinyl</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">PRESSING</span>
                        <span class="meta-value">First Edition</span>
                    </div>
                </div>

                <!-- Кнопка заказа / запроса -->
                <div class="record-detail__action">
                    <a href="#inquire" class="btn btn-accent">INQUIRE ABOUT THIS RECORD</a>
                </div>
            </div>
        </div>