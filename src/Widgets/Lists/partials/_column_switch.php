<span class="list-switch <?= $value ? 'is-true' : 'is-false' ?>">
    <?php if ($value): ?>
        <?= \Larajax\Ui\Facades\Ui::icon('list.switch.true', ['data-bs-toggle' => 'tooltip', 'title' => $trueValue]) ?>
    <?php else: ?>
        <?= \Larajax\Ui\Facades\Ui::icon('list.switch.false', ['data-bs-toggle' => 'tooltip', 'title' => $falseValue]) ?>
    <?php endif ?>
</span>