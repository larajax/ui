<tr>
    <?php if ($showCheckboxes): ?>
        <th class="list-checkbox">
            <input type="checkbox" class="form-check-input" />
        </th>
    <?php endif ?>
    <?php if ($showReorder): ?>
        <th class="list-reorder"></th>
    <?php endif ?>
    <?php $index = 0; foreach ($columns as $key => $column): ?>
        <?php
            $index++;
            $styles = [];
            if ($column->width) {
                $styles[] = 'width: '.$column->width;
            }

            $classes = [
                'list-cell-name-'.$column->getName(),
                'list-cell-type-'.$column->type,
                $column->getAlignClass(),
                $column->headCssClass
            ];

            if ($column->tooltip) {
                $classes[] = 'has-tooltip';
            }

            if ($showReorder && $index === 1) {
                $styles[] = 'padding-left: '.$this->getIndentStartSize(0).'px';
                $classes[] = 'explicit-left-padding';
            }
        ?>
        <?php if ($showSorting && $column->sortable): ?>
            <?php
                $isSorted = $this->sortColumn == $column->columnName;
                $classes[] = $isSorted
                    ? 'sort-'.$this->sortDirection.' active'
                    : 'sort-desc';
                $sortIcon = 'list.sort.'.($isSorted ? $this->sortDirection : 'desc');
            ?>
            <th style="<?= implode(';', $styles) ?>" class="<?= implode(' ', $classes) ?>">
                <a
                    href="javascript:;"
                    data-request="<?= $this->getEventHandler('onSort') ?>"
                    data-stripe-load-indicator
                    data-request-data="sortColumn: '<?= $column->columnName ?>', page: <?= $pageCurrent ?>"
                ><?= $this->getHeaderValue($column) ?><?php if ($column->tooltip): ?><?=
                    $this->makePartial('list_head_tooltip', ['column' => $column])
                ?><?php endif ?><?= \Larajax\Ui\Facades\Ui::icon($sortIcon, ['class' => 'sort-icon']) ?></a>
            </th>
        <?php else: ?>
            <th style="<?= implode(';', $styles) ?>" class="<?= implode(' ', $classes) ?>">
                <span><?= $this->getHeaderValue($column) ?><?php if ($column->tooltip): ?><?=
                    $this->makePartial('list_head_tooltip', ['column' => $column])
                ?><?php endif ?></span>
            </th>
        <?php endif ?>
    <?php endforeach ?>

    <?php if (!$useStructure): ?>
        <th class="list-setup setup-show-structure">
            <a href="javascript:;"
                title="<?= __("Show Structure") ?>"
                data-request="<?= $this->getEventHandler('onShowStructure') ?>"><span><?= \Larajax\Ui\Facades\Ui::icon('list.structure') ?></span></a>
        </th>
    <?php endif ?>
</tr>
