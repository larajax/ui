<?php /* The repeater control drives the add request from these links (see repeater.js) */ ?>
<script type="text/template" data-group-palette-template>
    <div class="popover-head">
        <h3><?= e(__($prompt)) ?></h3>
        <button type="button" class="btn-close"
            data-dismiss="popover"
            aria-label="<?= __("Close") ?>"></button>
    </div>
    <div class="popover-fixed-height field-repeater-selection-list">
        <ul>
            <?php foreach ($groupDefinitions as $item): ?>
                <li class="<?= $item['description'] ? 'has-description' : 'no-description' ?>">
                    <a
                        href="javascript:;"
                        data-repeater-add
                        data-repeater-add-group="<?= e($item['code']) ?>">
                        <?= \Larajax\Ui\Facades\Ui::icon($item['icon'], ['class' => 'list-icon']) ?>
                        <span class="title"><?= e(__($item['name'])) ?></span>
                        <?php if ($item['description']): ?>
                            <span class="description"><?= e(__($item['description'])) ?></span>
                        <?php endif ?>
                    </a>
                </li>
            <?php endforeach ?>
        </ul>
    </div>
</script>
