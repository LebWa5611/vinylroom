<?php
/**
 * Template Name: Record Detail
 */

get_header(); 
?>

<main class="main-content">
    <section class="record-detail">
        <div class="container">
            
            <!-- Кнопка назад -->
            <div class="record-detail__back">
                <a href="<?php echo esc_url(home_url('/')); ?>" class="back-link">
                    <span>←</span> BACK TO RECORDS
                </a>
            </div>

            <!-- Основной контент карточки (две колонки) -->
            <div class="record-detail__grid">
                
                <!-- Левая колонка: Обложка -->
                <div class="record-detail__media">
                    <div class="record-detail__image-wrap">
                        <img src="<?php echo esc_url(get_template_directory_uri() . '/src/images/Artwork Outer Frame.png'); ?>" alt="Slow Voltage" class="record-detail__img">
                    </div>
                </div>

                <!-- Правая колонка: Информация -->
                <div class="record-detail__info">
                    <div class="record-detail__tag">ROCK</div>
                    
                    <h1 class="record-detail__title">Slow Voltage</h1>
                    <p class="record-detail__artist-subtitle">The Wrecking Light</p>
                    
                    <div class="record-detail__price">€34.00</div>

                    <!-- Мета-данные сеткой 3x2 -->
                    <div class="record-detail__meta-grid">
                        <div class="meta-item">
                            <span class="meta-label">ARTIST</span>
                            <span class="meta-value">The Wrecking Light</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">GENRE</span>
                            <span class="meta-value">Rock</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">RELEASED</span>
                            <span class="meta-value">2024</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">LABEL</span>
                            <span class="meta-value">Independent</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">FORMAT</span>
                            <span class="meta-value">180g Vinyl</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">PRESSING</span>
                            <span class="meta-value">First Edition</span>
                        </div>
                    </div>

                    <!-- Кнопка заказа / запроса -->
                    <div class="record-detail__action">
                        <a href="#inquire" class="btn btn-accent">INQUIRE ABOUT THIS RECORD</a>
                    </div>
                </div>

            </div>

            <!-- Текстовое описание в две колонки -->
            <div class="record-detail__description">
                <div class="record-detail__desc-col">
                    <p>A record that refuses to rush. The Wrecking Light's third album is a study in tension and release — layered guitars that build patiently before crashing forward.</p>
                </div>
                <div class="record-detail__desc-col">
                    <p>Slow Voltage opens with the deceptively quiet title track, a six-minute meditation on restlessness that sets the tone for all flowers that follows. From there, the album moves through ten tracks of carefully constructed guitar rock — each song a study in dynamics, where whispered verses give way to walls of sound.</p>
                    <p>The production is deliberately warm, favoring analog tape and room microphones over digital precision. Recorded over three months at a converted warehouse in Bristol, the album captures the sound of a band playing together in each other's energy.</p>
                </div>
            </div>

            <!-- Треклист -->
            <div class="record-detail__tracklist">
                <h3 class="tracklist-title">TRACKLIST</h3>
                
                <ul class="tracklist-list">
                    <li class="track-item">
                        <span class="track-number">01</span>
                        <span class="track-name">Slow Voltage</span>
                        <span class="track-time">6:12</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">02</span>
                        <span class="track-name">Wire & Weather</span>
                        <span class="track-time">4:45</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">03</span>
                        <span class="track-name">The Long Dissolve</span>
                        <span class="track-time">5:18</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">04</span>
                        <span class="track-name">Harbor District</span>
                        <span class="track-time">3:52</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">05</span>
                        <span class="track-name">Signal Return</span>
                        <span class="track-time">4:21</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">06</span>
                        <span class="track-name">Basement Tapes</span>
                        <span class="track-time">7:03</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">07</span>
                        <span class="track-name">Rust & Refrain</span>
                        <span class="track-time">4:56</span>
                    </li>
                    <li class="track-item">
                        <span class="track-number">08</span>
                        <span class="track-name">Last Frequency</span>
                        <span class="track-time">8:14</span>
                    </li>
                </ul>
            </div>

        </div>
    </section>
</main>

<?php
// Вывод блока «More from the Collection»
get_template_part('template-parts/RelatedRecords/related-records');

get_footer();
?>