<?php
/**
 * Template part for displaying the Editor's Pick section
 */
?>

<section class="editor-pick">
    <div class="container">
        <div class="editor-pick__header">
            <span class="editor-pick__number">02</span>
            <h2 class="editor-pick__title">Editor’s Pick</h2>
        </div>

        <div class="editor-pick__content-wrap">
            <div class="editor-pick__image-wrap">
                <img src="<?php echo get_template_directory_uri(); ?>/src/Images/Editors Pick Artwork.png" alt="The Wrecking Light">
            </div>
            
            <div class="editor-pick__info">
                <span class="editor-pick__tag">Slow Voltage</span>
                <h3 class="editor-pick__album-title">The Wrecking Light</h3>
                
                <div class="editor-pick__meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Genre & Edition</span>
                        <span class="meta-value">Rock / 180g Vinyl</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Released</span>
                        <span class="meta-value">2024 / Independent</span>
                    </div>
                </div>

                <p class="editor-pick__description">
                    A record that refuses to rush. The Wrecking Light’s third album is a study in tension and release — layered guitars, patient rhythmic builds, and raw poetic lyrics that reward close listening on high-quality analog equipment. Our definitive pick for the season.
                </p>

                <div class="editor-pick__action">
                    <a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>" class="btn-view-record">View Record</a>
                </div>
            </div>
        </div>
    </div>
</section>