<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<header class="site-header">
    <div class="container site-header__container">
        <div class="site-header__logo">
            <a href="<?php echo esc_url(home_url('/')); ?>">
                <img src="<?php echo get_template_directory_uri(); ?>/src/images/Logo-Vinyl-Room.svg" alt="Vinyl Room">
            </a>
        </div>

        <!-- Десктопное меню -->
        <nav class="site-nav site-nav--desktop">
            <ul class="site-nav__list">
                <li><a href="<?php echo esc_url(home_url('/')); ?>">HOME</a></li>
                <li><a href="<?php echo esc_url( home_url( '/record-detail/' ) ); ?>">RECORDS</a></li>
                <li><a href="<?php echo esc_url( home_url('/') ); ?>">ABOUT</a></li>
                <li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">CONTACT</a></li>
            </ul>
        </nav>

        <!-- Блок действий для десктопа (лупа) -->
        <div class="site-header__actions">
            <button class="search-toggle-btn" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>
        </div>

        <!-- Кнопка бургера (только на мобилке) -->
        <button class="burger-menu-btn" id="burgerToggle" aria-label="Open Menu">
            <span class="burger-line"></span>
            <span class="burger-line"></span>
            <span class="burger-line"></span>
        </button>
    </div>

    <!-- Мобильное полноэкранное меню (как в Figma) -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="container mobile-menu__container">
            <div class="mobile-menu__header">
                <div class="site-header__logo">
                    <a href="<?php echo esc_url(home_url('/')); ?>">
                        <img src="<?php echo get_template_directory_uri(); ?>/src/images/Logo-Vinyl-Room.svg" alt="Vinyl Room">
                    </a>
                </div>
                <!-- Кнопка закрытия со стрелочкой влево как в макете -->
                <button class="mobile-menu__close" id="burgerClose" aria-label="Close Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </div>

            <nav class="mobile-nav">
                <ul class="mobile-nav__list">
                    <li><a href="#catalog">CATALOG</a></li>
                    <li><a href="#genres">GENRES</a></li>
                    <li><a href="#new-arrivals">NEW ARRIVALS</a></li>
                    <li><a href="#about">ABOUT</a></li>
                </ul>
            </nav>

            <!-- Футер внутри мобильного меню из фигмы -->
            <div class="mobile-menu__footer">
                <p>Prinsengracht 263<br>1016 GV Amsterdam</p>
                <p class="mobile-menu__hours">MON-SAT 11:00-20:00 &nbsp;•&nbsp; SUN 12:00-18:00</p>
            </div>
        </div>
    </div>
</header>