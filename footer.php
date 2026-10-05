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
                    <ul class="footer__menu-list">
                        <li><a href="<?php echo home_url('/catalog'); ?>">Catalog</a></li>
                        <li><a href="<?php echo home_url('/new-arrivals'); ?>">New Arrivals</a></li>
                        <li><a href="<?php echo home_url('/genres'); ?>">Genres</a></li>
                        <li><a href="<?php echo home_url('/labels'); ?>">Labels</a></li>
                    </ul>
                </div>

                <div class="footer__menu-col">
                    <h4 class="footer__menu-title">INFO</h4>
                    <ul class="footer__menu-list">
                        <li><a href="<?php echo home_url('/about'); ?>">About</a></li>
                        <li><a href="<?php echo home_url('/contact'); ?>">Contact</a></li>
                        <li><a href="<?php echo home_url('/shipping'); ?>">Shipping</a></li>
                        <li><a href="<?php echo home_url('/faq'); ?>">FAQ</a></li>
                    </ul>
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