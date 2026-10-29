<?php if ($value): ?>
    <ul class="list-link-list">
        <li><a href="<?= e($linkUrl) ?>" <?= Html::attributes($attributes) ?>><?= $column->getDisplayValue($linkText) ?></a></li>
    </ul>
<?php endif ?>
