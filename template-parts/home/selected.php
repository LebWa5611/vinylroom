<?php
/**
 * Template part for displaying the Brand Philosophy / Selected for Listening section
 */

// Получаем группу полей из ACF
$listening = get_field('selected_listening_section');

// Проверяем, заполнена ли группа
if ( $listening ):
    $title      = isset($listening['title']) ? $listening['title'] : '';
    $text_first = isset($listening['text_first']) ? $listening['text_first'] : '';
    $text_second= isset($listening['text_second']) ? $listening['text_second'] : '';
    $image      = isset($listening['image']) ? $listening['image'] : '';
?>

<section class="selected-listening">
    <div class="container">
        <div class="selected-listening__grid">
            <div class="selected-listening__title-wrap">
                <?php if ( $title ): ?>
                    <h2 class="selected-listening__title"><?php echo esc_html( $title ); ?></h2>
                <?php endif; ?>
            </div>
            <div class="selected-listening__text-wrap">
                <?php if ( $text_first ): ?>
                    <p class="selected-listening__text">
                        <?php echo esc_html( $text_first ); ?>
                    </p>
                <?php endif; ?>
                
                <?php if ( $text_second ): ?>
                    <p class="selected-listening__text">
                        <?php echo esc_html( $text_second ); ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>

        <?php if ( $image ): ?>
            <div class="selected-listening__image-wrap">
                <?php 
                    $img_url = is_array($image) ? $image['url'] : wp_get_attachment_image_url($image, 'full'); 
                ?>
                <img src="<?php echo esc_url( $img_url ); ?>" alt="Vinyl store interior">
            </div>
        <?php endif; ?>
    </div>
</section>

<?php endif; ?>