<section class="hero">
    <div class="hero__container">
        <!-- Текстовый блок -->
        <div class="hero__content">
            <h1 class="hero__title">Needle down.<br> Volume up.</h1>
            <p class="hero__description">
                Curated vinyl records for listeners who care about what they hear. 
                Hand-selected classics and contemporary releases from our independent archive.
            </p>
            
            <!-- Кнопка для десктопа (находится внутри текста) -->
            <div class="hero__action hero__action--desktop">
                <a href="#browse" class="button hero__button">Browse records</a>
            </div>
        </div>
        
        <!-- Блок с картинкой -->
        <div class="hero__visual" aria-hidden="true">
            <div class="hero__artwork-wrapper">
                <picture>
                    <!-- Мобильная картинка (до 1024px) -->
                    <source media="(max-width: 1023px)" srcset="<?php echo get_template_directory_uri(); ?>/dist/images/hero-cover-mobile.png">
                    <!-- Десктопная картинка -->
                    <img src="<?php echo get_template_directory_uri(); ?>/dist/images/Hero Visual Frame.png" alt="Vinyl Collection" class="hero__artwork-image">
                </picture>
            </div>
        </div>

        <!-- Кнопка для мобилки (находится под картинкой) -->
        <div class="hero__action hero__action--mobile">
            <a href="#browse" class="button hero__button">Browse records</a>
        </div>
    </div>
</section>