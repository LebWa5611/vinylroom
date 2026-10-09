<?php
/**
 * Template part for displaying the Voltage Description section
 */

$description_sec = get_field('description_section');

$col_1 = $description_sec['description_column_1'] ?? '';
$col_2 = $description_sec['description_column_2'] ?? '';
$col_3 = $description_sec['description_column_3'] ?? '';
?>

<?php if ($col_1 || $col_2 || $col_3): ?>
<section class="record-detail">
    <div class="container">
        <!-- Текстовое описание -->
        <div class="record-detail__description">
            <?php if ($col_1): ?>
                <div class="record-detail__desc-col">
                    <?php echo wp_kses_post($col_1); ?>
                </div>
            <?php endif; ?>
            
            <?php if ($col_2 || $col_3): ?>
                <div class="record-detail__desc-col">
                    <?php if ($col_2): ?>
                        <div class="record-detail__text-block">
                            <?php echo wp_kses_post($col_2); ?>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($col_3): ?>
                        <div class="record-detail__text-block" style="margin-top: 24px;">
                            <?php echo wp_kses_post($col_3); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php endif; ?>