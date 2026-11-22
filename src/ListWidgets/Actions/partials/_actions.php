<?= \Larajax\Ui\Facades\Ui::button(
    icon: $icon,
    class: 'list-actions-toggle',
    title: $label,
    ariaLabel: $label,
    dataBsToggle: 'menu',
    dataBsPlacement: 'bottom-end',
    dataBsStrategy: 'fixed',
    ariaExpanded: 'false'
) ?>
<div class="menu control-dropdown" role="menu">
    <?= $items ?>
</div>
