<?php
/**
 * Template part for displaying the Editor's Pick section
 */

// Получаем группу полей Editor's Pick из ACF
$editor_pick = get_field('editors_pick_section');

// Проверяем, заполнена ли группа
if ( $editor_pick ):
    $section_title  = isset($editor_pick['section_title']) ? $editor_pick['section_title'] : 'Editor’s Pick';
    $image          = isset($editor_pick['pick_image']) ? $editor_pick['pick_image'] : '';
    $tag            = isset($editor_pick['pick_tag']) ? $editor_pick['pick_tag'] : '';
    $album_title    = isset($editor_pick['pick_album_title']) ? $editor_pick['pick_album_title'] : '';
    $genre_edition  = isset($editor_pick['pick_genre_edition']) ? $editor_pick['pick_genre_edition'] : '';
    $released       = isset($editor_pick['pick_released']) ? $editor_pick['pick_released'] : '';
    $description    = isset($editor_pick['pick_description']) ? $editor_pick['pick_description'] : '';
    $button         = isset($editor_pick['pick_link']) ? $editor_pick['pick_link'] : '';
?>

<section class="editor-pick">
    <div class="container">
        <div class="editor-pick__header">
            <span class="editor-pick__number">02</span>
            <h2 class="editor-pick__title"><?php echo esc_html( $section_title ); ?></h2>
        </div>

        <div class="editor-pick__content-wrap">
            <div class="editor-pick__image-wrap">
                <?php if ( $image ): ?>
                    <?php 
                        $img_url = is_array($image) ? $image['url'] : wp_get_attachment_image_url($image, 'full'); 
                    ?>
                    <img src="<?php echo esc_url( $img_url ); ?>" alt="<?php echo esc_attr( $album_title ? $album_title : 'Editor Pick' ); ?>">
                <?php endif; ?>
            </div>
            
            <div class="editor-pick__info">
                <?php if ( $tag ): ?>
                    <span class="editor-pick__tag"><?php echo esc_html( $tag ); ?></span>
                <?php endif; ?>

                <?php if ( $album_title ): ?>
                    <h3 class="editor-pick__album-title"><?php echo esc_html( $album_title ); ?></h3>
                <?php endif; ?>
                
                <div class="editor-pick__meta-grid">
                    <?php if ( $genre_edition ): ?>
                        <div class="meta-item">
                            <span class="meta-label">Genre & Edition</span>
                            <span class="meta-value"><?php echo esc_html( $genre_edition ); ?></span>
                        </div>
                    <?php endif; ?>

                    <?php if ( $released ): ?>
                        <div class="meta-item">
                            <span class="meta-label">Released</span>
                            <span class="meta-value"><?php echo esc_html( $released ); ?></span>
                        </div>
                    <?php endif; ?>
                </div>

                <?php if ( $description ): ?>
                    <p class="editor-pick__description">
                        <?php echo esc_html( $description ); ?>
                    </p>
                <?php endif; ?>

                <?php if ( $button ): ?>
                    <div class="editor-pick__action">
                        <a href="<?php echo esc_url( is_array($button) ? $button['url'] : $button ); ?>" 
                           class="btn-view-record" 
                           <?php echo (is_array($button) && !empty($button['target'])) ? 'target="' . esc_attr($button['target']) . '"' : ''; ?>>
                            <?php echo esc_html( (is_array($button) && !empty($button['title'])) ? $button['title'] : 'View Record' ); ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<?php endif; ?>