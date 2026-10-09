<?php 
// Получаем группу полей Hero Section из ACF
$hero = get_field('hero_section');

// Проверяем, заполнена ли группа
if ( $hero ): 
    // Извлекаем значения с защитой от пустых ключей
    $title       = isset($hero['hero_title']) ? $hero['hero_title'] : '';
    $description = isset($hero['hero_description']) ? $hero['hero_description'] : '';
    $button      = isset($hero['hero_button']) ? $hero['hero_button'] : '';
    $img_desktop = isset($hero['hero_image_desktop']) ? $hero['hero_image_desktop'] : '';
    $img_mobile  = isset($hero['hero_image_mobile']) ? $hero['hero_image_mobile'] : '';
?>
<section class="hero">
    <div class="hero__container">
        <!-- Текстовый блок -->
        <div class="hero__content">
            <?php if ( $title ): ?>
                <h1 class="hero__title"><?php echo wp_kses_post( nl2br($title) ); ?></h1>
            <?php endif; ?>

            <?php if ( $description ): ?>
                <p class="hero__description">
                    <?php echo esc_html( $description ); ?>
                </p>
            <?php endif; ?>
            
            <!-- Кнопка для десктопа (находится внутри текста) -->
            <?php if ( $button ): ?>
                <div class="hero__action hero__action--desktop">
                    <a href="<?php echo esc_url( $button['url'] ); ?>" 
                       class="button hero__button" 
                       <?php echo !empty($button['target']) ? 'target="' . esc_attr($button['target']) . '"' : ''; ?>>
                        <?php echo esc_html( $button['title'] ); ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Блок с картинкой -->
        <div class="hero__visual" aria-hidden="true">
            <div class="hero__artwork-wrapper">
                <picture>
                    <!-- Мобильная картинка (до 1024px) -->
                    <?php if ( $img_mobile ): ?>
                        <source media="(max-width: 1023px)" srcset="<?php echo esc_url( $img_mobile ); ?>">
                    <?php endif; ?>
                    
                    <!-- Десктопная картинка -->
                    <?php if ( $img_desktop ): ?>
                        <img src="<?php echo esc_url( $img_desktop ); ?>" alt="Vinyl Collection" class="hero__artwork-image">
                    <?php endif; ?>
                </picture>
            </div>
        </div>

        <!-- Кнопка для мобилки (находится под картинкой) -->
        <?php if ( $button ): ?>
            <div class="hero__action hero__action--mobile">
                <a href="<?php echo esc_url( $button['url'] ); ?>" 
                   class="button hero__button" 
                   <?php echo !empty($button['target']) ? 'target="' . esc_attr($button['target']) . '"' : ''; ?>>
                    <?php echo esc_html( $button['title'] ); ?>
                </a>
            </div>
        <?php endif; ?>
    </div>
</section>
<?php endif; ?>