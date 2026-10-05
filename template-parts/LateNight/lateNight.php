<?php
/**
 * Template part for displaying the Late Night Listening section
 */
?>

<section class="late-night">
    <div class="container">
        <div class="late-night__header">
            <div class="late-night__subtitle-row">
                <span class="late-night__number">03</span>
                <span class="late-night__label">LATE NIGHT LISTENING</span>
            </div>
            <p class="late-night__desc">Three records for when the city quiets down.</p>
        </div>

        <div class="late-night__grid">
            <!-- Card 1 -->
            <div class="record-card">
                <div class="record-card__image">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (6).png" alt="After Hours in Tokyo">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">After Hours in Tokyo</h3>
                    <p class="record-card__artist">Yuki Sato</p>
                    <div class="record-card__meta">
                        <span class="record-card__tag">JAZZ</span>
                        <span class="record-card__year">2024</span>
                    </div>
                    <div class="record-card__price">€33.00</div>
                </div>
            </div>

            <!-- Card 2 -->
            <div class="record-card">
                <div class="record-card__image">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (7).png" alt="Low Light">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">Low Light</h3>
                    <p class="record-card__artist">Minor Keys</p>
                    <div class="record-card__meta">
                        <span class="record-card__tag">ELECTRONIC</span>
                        <span class="record-card__year">2024</span>
                    </div>
                    <div class="record-card__price">€35.00</div>
                </div>
            </div>

            <!-- Card 3 -->
            <div class="record-card">
                <div class="record-card__image">
                    <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Album Artwork (8).png" alt="The Quiet Year">
                </div>
                <div class="record-card__content">
                    <h3 class="record-card__title">The Quiet Year</h3>
                    <p class="record-card__artist">Helen Gould</p>
                    <div class="record-card__meta">
                        <span class="record-card__tag">ROCK</span>
                        <span class="record-card__year">2023</span>
                    </div>
                    <div class="record-card__price">€30.00</div>
                </div>
            </div>
        </div>
    </div>
</section>