<?= \Larajax\Ui\Facades\Ui::iconButton(
    label: $label,
    icon: $icon,
    class: 'list-actions-toggle',
    dataBsToggle: 'menu',
    dataBsPlacement: 'bottom-end',
    dataBsStrategy: 'fixed',
    ariaExpanded: 'false'
) ?>
<div class="menu control-dropdown" role="menu">
    <?= $items ?>
</div>
