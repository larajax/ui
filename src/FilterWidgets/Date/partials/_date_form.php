<div
    data-control="datefilter"
    class="filter-box loading-indicator-container size-input-text"
    data-scope-data="<?= e(json_encode([
        'minDate' => $scope->minDate,
        'maxDate' => $scope->maxDate,
        'firstDay' => $scope->firstDay,
        'yearRange' => $scope->yearRange,
        'showWeekNumber' => $scope->showWeekNumber,
        'useTimezone' => $scope->useTimezone,
    ])) ?>"
>
    <?php
        $conditions = array_keys((array) $scope->conditions);
        $relativeConditions = array_values(array_intersect($conditions, ['inLast', 'inNext']));

        // Every other condition takes a single date, and the empty ones take no input
        $otherConditions = ['between', 'inLast', 'inNext', 'empty', 'notEmpty'];
        $hasSingleCondition = (bool) array_diff($conditions, $otherConditions);
    ?>
    <?php if (count($conditions) === 1): ?>
        <?php $condition = $conditions[0] ?>
        <div class="filter-facet">
            <div class="facet-item">
                <input type="hidden" name="Filter[condition]" value="<?= e($condition) ?>" />
                <span><?= $this->getConditionLang($condition) ?></span>
            </div>
            <?php if ($condition === 'between'): ?>
                <?= $this->makePartial('item_between') ?>
            <?php elseif ($relativeConditions): ?>
                <?= $this->makePartial('item_relative') ?>
            <?php elseif ($hasSingleCondition): ?>
                <?= $this->makePartial('item_single') ?>
            <?php endif ?>
        </div>
    <?php else: ?>
        <div class="filter-facet">
            <div class="facet-item is-grow">
                <select name="Filter[condition]" class="form-control custom-select select-no-search">
                    <?php foreach ($conditions as $condition): ?>
                        <option
                            value="<?= e($condition) ?>"
                            <?= $scope->condition === $condition ? 'selected="selected"' : '' ?>
                        ><?= $this->getConditionLang($condition) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        </div>
        <?php if ($relativeConditions): ?>
            <div class="filter-facet"
                data-trigger="[name='Filter[condition]']"
                data-trigger-action="show"
                data-trigger-condition="value[<?= implode('][', $relativeConditions) ?>]"
                data-trigger-closest-parent="form">
                <div class="facet-item">
                    <span>└─</span>
                </div>
                <?= $this->makePartial('item_relative') ?>
            </div>
        <?php endif ?>
        <?php if ($hasSingleCondition): ?>
            <div class="filter-facet"
                data-trigger="[name='Filter[condition]']"
                data-trigger-action="hide"
                data-trigger-condition="value[<?= implode('][', $otherConditions) ?>]"
                data-trigger-closest-parent="form">
                <div class="facet-item">
                    <span>└─</span>
                </div>
                <?= $this->makePartial('item_single') ?>
            </div>
        <?php endif ?>
        <?php if (in_array('between', $conditions, true)): ?>
            <div class="filter-facet"
                data-trigger="[name='Filter[condition]']"
                data-trigger-action="show"
                data-trigger-condition="value[between]"
                data-trigger-closest-parent="form">
                <div class="facet-item">
                    <span>└─</span>
                </div>
                <?= $this->makePartial('item_between') ?>
            </div>
        <?php endif ?>
    <?php endif ?>

    <div class="filter-buttons">
        <button type="button" class="btn-solid theme-secondary" data-filter-action="clear">
            <?= __("Clear") ?>
        </button>
        <div class="flex-grow-1"></div>
        <button type="submit" class="btn-solid theme-primary" data-filter-action="apply">
            <?= __("Apply") ?>
        </button>
    </div>
</div>
