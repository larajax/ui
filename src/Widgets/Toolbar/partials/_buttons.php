<div data-control="toolbar">
    <?php foreach ($buttons as $button): ?>
        <?= $this->makePartial('button', ['button' => $button]) ?>
    <?php endforeach ?>
</div>
