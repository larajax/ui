<tr>
    <?php if ($showCheckboxes): ?>
        <th class="list-checkbox">
            <input type="checkbox" class="check" />
        </th>
    <?php endif ?>
    <?php if ($showReorder): ?>
        <th class="list-reorder"></th>
    <?php endif ?>
    <?php $index = 0; foreach ($columns as $key => $column): ?>
        <?php
            $index++;

            // A sorted list shows its way back to the structure at the end of the last head cell, which drops a set width to fit it
            $hasStructureLink = $showStructureLink && $index === count($columns);

            $styles = [];
            if ($column->width && !$hasStructureLink) {
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

            if ($hasStructureLink) {
                $classes[] = 'has-show-structure';
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
                <?php if ($hasStructureLink): ?>
                    <?= $this->makePartial('list_show_structure') ?>
                <?php endif ?>
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
                <?php if ($hasStructureLink): ?>
                    <?= $this->makePartial('list_show_structure') ?>
                <?php endif ?>
                <span><?= $this->getHeaderValue($column) ?><?php if ($column->tooltip): ?><?=
                    $this->makePartial('list_head_tooltip', ['column' => $column])
                ?><?php endif ?></span>
            </th>
        <?php endif ?>
    <?php endforeach ?>
</tr>
