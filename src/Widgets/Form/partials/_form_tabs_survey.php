
<div class="form-survey row gy-3">
    <?php $index = 0; foreach ($tabs as $name => $fields): $index++ ?>
        <div class="col-12 <?= e($tabs->getPaneCssClass($index, $name)) ?>">
            <div class="card <?= $tabs->stretch ? 'h-100' : '' ?>">
                <h4 class="card-header d-flex flex-row align-items-center gap-2">
                    <?php if ($icon = $tabs->getIcon($name)): ?>
                        <span class="<?= e($icon) ?>" aria-hidden="true"></span>
                    <?php endif ?>
                    <?= e(trans($name)) ?>
                </h4>
                <div class="card-body d-block">
                    <?= $this->makePartial('form_fields', ['fields' => $fields]) ?>
                </div>
            </div>
        </div>
    <?php endforeach ?>
</div>
