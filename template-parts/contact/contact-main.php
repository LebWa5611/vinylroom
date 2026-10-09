<?php
/**
 * Template part for displaying the Contact Main section (Info + Form)
 */

// Получаем всю группу полей в виде массива
$contact_group = get_field('contact_main_section');

// Если группа пуста, можно задать пустой массив, чтобы избежать ошибок
$email         = $contact_group['contact_email'] ?? '';
$phone         = $contact_group['contact_phone'] ?? '';
$city          = $contact_group['contact_city'] ?? '';
$address_text  = $contact_group['contact_address_text'] ?? '';
$opening_hours = $contact_group['opening_hours'] ?? [];
?>

<section class="contact-main-section">
    <div class="container">
        <!-- Основная сетка: Контактная инфо слева + Форма справа -->
        <div class="contact-grid">
            
            <!-- Левая колонка: Данные и часы работы -->
            <div class="contact-info">
                
                <!-- Email и Телефон -->
                <?php if ($email || $phone) : ?>
                <div class="contact-info__block">
                    <span class="contact-label">GET IN TOUCH</span>
                    <ul class="contact-list">
                        <?php if ($email) : ?>
                            <li><span>EMAIL</span> <a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></li>
                        <?php endif; ?>
                        
                        <?php if ($phone) : ?>
                            <li><span>PHONE</span> <a href="tel:<?php echo esc_attr(preg_replace('/[^0-9+]/', '', $phone)); ?>"><?php echo esc_html($phone); ?></a></li>
                        <?php endif; ?>
                    </ul>
                </div>
                <?php endif; ?>

                <!-- Адрес -->
                <?php if ($city || $address_text) : ?>
                <div class="contact-info__block">
                    <span class="contact-label">VISIT THE ROOM</span>
                    <p class="contact-address">
                        <?php if ($city) : ?>
                            <span class="city-name"><?php echo esc_html($city); ?></span>
                        <?php endif; ?>
                        
                        <?php 
                        if ($address_text) {
                            // nl2br сохраняет переносы строк из textarea в админке
                            echo nl2br(esc_html($address_text));
                        }
                        ?>
                    </p>
                </div>
                <?php endif; ?>

                <!-- Часы работы (Повторитель внутри группы) -->
                <?php if (!empty($opening_hours) && is_array($opening_hours)) : ?>
                <div class="contact-info__block">
                    <span class="contact-label">OPENING HOURS</span>
                    <ul class="hours-list">
                        <?php foreach ($opening_hours as $row) : 
                            $day  = $row['day_label'] ?? '';
                            $time = $row['day_time'] ?? '';
                            // Проверяем, закрыто ли, чтобы добавить класс
                            $is_closed = (mb_strtoupper($time) === 'CLOSED');
                        ?>
                            <li>
                                <span><?php echo esc_html($day); ?></span> 
                                <span class="<?php echo $is_closed ? 'closed' : ''; ?>">
                                    <?php echo esc_html($time); ?>
                                </span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <?php endif; ?>

            </div>

            <!-- Правая колонка: Форма обратной связи (статичная) -->
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
                        <input type="text" id="subject" name="subject" placeholder="Your subject...">
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
    </div>
</section>