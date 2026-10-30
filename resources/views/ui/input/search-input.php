<?php
$name ??= '';
$placeholder ??= '';
$value ??= '';
$handler ??= '';

if ($handler) {
    $attributes = $attributes->merge([
        'data-request' => $handler,
        'data-request-trigger' => 'input changed delay:500',
        'data-load-indicator' => '',
        'data-load-indicator-opaque' => true,
    ]);
}
?>
<div <?= $attributes->only([])->merge([
    'data-control' => 'search-input',
    'class' => $attributes->get('outer-class')
]) ?>>
    <label <?= $attributes->only(['class'])->merge(['class' => 'form-control form-adorn']) ?>>
        <span class="form-adorn-icon" aria-hidden="true">
            <?= \Larajax\Ui\Facades\Ui::icon('search.icon') ?>
        </span>
        <input
            <?= $attributes->except([
                'outer-class',
                'class'
            ])->merge([
                'type' => 'text',
                'name' => $name,
                'placeholder' => $placeholder,
                'value' => $value,
                'aria-label' => $placeholder ?: __('Search'),
                'class' => 'form-ghost',
                'autocomplete' => 'off',
                'data-search-input' => true
            ]) ?>
        />
        <button
            class="clear-input-text"
            type="button"
            value=""
            style="display:none"
            aria-label="<?= e(__('Clear')) ?>"
            data-search-clear
        >
            <?= \Larajax\Ui\Facades\Ui::icon('search.clear') ?>
        </button>
    </label>
</div>
