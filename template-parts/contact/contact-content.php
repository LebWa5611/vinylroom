<section class="contact-page">
    <div class="container">
        
        <!-- Герой-секция контактов -->
        <div class="contact-hero">
            <div class="contact-hero__text">
                <h1 class="contact-hero__title">TALK MUSIC WITH US.</h1>
                <p class="contact-hero__desc">Whether you're hunting for a specific pressing, want to know what's arriving next, or just want to talk records — we're here.</p>
            </div>
            <div class="contact-hero__image">
                <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Hero Visual Frame (1).png'); ?>" alt="Sound Spectrum Interior">
            </div>
        </div>

        <!-- Основная сетка: Контактная инфо слева + Форма справа -->
        <div class="contact-grid">
            
            <!-- Левая колонка: Данные и часы работы -->
            <div class="contact-info">
                
                <div class="contact-info__block">
                    <span class="contact-label">GET IN TOUCH</span>
                    <ul class="contact-list">
                        <li><span>EMAIL</span> <a href="mailto:hello@vinylroom.store">hello@vinylroom.store</a></li>
                        <li><span>PHONE</span> <a href="tel:+31205550192">+31 20 555 0192</a></li>
                    </ul>
                </div>

                <div class="contact-info__block">
                    <span class="contact-label">VISIT THE ROOM</span>
                    <p class="contact-address">
                        AMSTERDAM OUTPOST<br>
                        Prinsengracht 142, 1015 EA Amsterdam<br>
                        The Netherlands
                    </p>
                </div>

                <div class="contact-info__block">
                    <span class="contact-label">OPENING HOURS</span>
                    <ul class="hours-list">
                        <li><span>Tuesday – Friday</span> <span>11:00 – 19:00</span></li>
                        <li><span>Saturday</span> <span>10:00 – 20:00</span></li>
                        <li><span>Sunday</span> <span>12:00 – 17:00</span></li>
                        <li><span>Monday</span> <span class="closed">CLOSED</span></li>
                    </ul>
                </div>

            </div>

            <!-- Правая колонка: Форма обратной связи -->
            <div class="contact-form-wrap">
                <form class="contact-form" action="#" method="POST">
                    
                    <div class="form-group">
                        <label for="name">YOUR NAME</label>
                        <input type="text" id="name" name="name" placeholder="e.g. Alex Moreno">
                    </div>

                    <div class="form-group">
                        <label for="email">EMAIL ADDRESS</label>
                        <input type="email" id="email" name="email" placeholder="alex.moreno@email.com">
                    </div>

                    <div class="form-group">
                        <label for="subject">SUBJECT</label>
                        <input type="text" id="subject" name="subject" value="S">
                        <span class="form-error">Subject must be at least 3 characters</span>
                    </div>

                    <div class="form-group">
                        <label for="message">MESSAGE</label>
                        <textarea id="message" name="message" rows="5" placeholder="Tell us what you're looking for..."></textarea>
                    </div>

                    <button type="submit" class="btn-accent">SEND MESSAGE</button>
                </form>
            </div>

        </div>

        <!-- Нижний баннер: EVERY RECORD TELLS A STORY -->
        <div class="editorial-banner">
            <div class="editorial-banner__text">
                <h2>EVERY RECORD TELLS A STORY.</h2>
            </div>
            <div class="editorial-banner__image">
                <img src="<?php echo esc_url(get_template_directory_uri() . '/src/Images/Crates Interior Photo.png'); ?>" alt="Crates Interior Photo">
            </div>
        </div>

    </div>
</section>