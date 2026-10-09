<?php
/**
 * The template for displaying the footer
 */
?>

<footer class="footer">
    <div class="container">
        <div class="footer__inner">
            <div class="footer__col-brand">
                <div class="footer__logo-wrap">
                    <span class="footer__logo-square"></span>
                    <span class="footer__logo-text">VINYL ROOM</span>
                </div>
                <p class="footer__desc">
                    Independent vinyl record store and curated music archive. Selected for real listeners.
                </p>
            </div>

            <div class="footer__col-links">
                <div class="footer__menu-col">
                    <h4 class="footer__menu-title">BROWSE</h4>
                    <?php
                    wp_nav_menu( array(
                        'theme_location' => 'footer-browse',
                        'container'      => false,
                        'menu_class'     => 'footer__menu-list',
                        'fallback_cb'    => false,
                    ) );
                    ?>
                </div>

                <div class="footer__menu-col">
                    <h4 class="footer__menu-title">INFO</h4>
                    <?php
                    wp_nav_menu( array(
                        'theme_location' => 'footer-info',
                        'container'      => false,
                        'menu_class'     => 'footer__menu-list',
                        'fallback_cb'    => false,
                    ) );
                    ?>
                </div>
            </div>
        </div>

        <div class="footer__bottom">
            <p class="footer__copy">&copy; <?php echo date('Y'); ?> VINYL ROOM. ALL RIGHTS RESERVED.</p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>