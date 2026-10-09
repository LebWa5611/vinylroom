<?php
/**
 * Template part for displaying the Voltage Tracklist section
 */

$tracklist_sec = get_field('tracklist_section');
$tracks = $tracklist_sec['tracks'] ?? [];
?>

<?php if (!empty($tracks)): ?>
<section class="record-detail">
    <div class="container">
        <!-- Треклист -->
        <div class="record-detail__tracklist">
            <h3 class="tracklist-title">TRACKLIST</h3>
            
            <ul class="tracklist-list">
                <?php foreach ($tracks as $track): ?>
                    <?php 
                        $number = $track['track_number'] ?? '';
                        $name   = $track['track_name'] ?? '';
                        $time   = $track['track_time'] ?? '';
                    ?>
                    <li class="track-item">
                        <?php if ($number): ?>
                            <span class="track-number"><?php echo esc_html($number); ?></span>
                        <?php endif; ?>
                        
                        <?php if ($name): ?>
                            <span class="track-name"><?php echo esc_html($name); ?></span>
                        <?php endif; ?>
                        
                        <?php if ($time): ?>
                            <span class="track-time"><?php echo esc_html($time); ?></span>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</section>
<?php endif; ?>