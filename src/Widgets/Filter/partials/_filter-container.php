<?php if ($primarySearch || $primaryScope): ?>
    <div class="filter-row filter-primary">
        <?php if ($primarySearch): ?>
            <?= $this->makePartial('list_controls') ?>
        <?php else: ?>
            <?= $this->makePartial('scope-container', ['scope' => $primaryScope]) ?>
        <?php endif ?>
    </div>
<?php endif ?>

<div class="filter-row filter-secondary">
    <?= $this->makePartial('filter_menu') ?>

    <div class="filter-scroll">
        <div class="filter-scopes">
            <?= $this->makePartial('filter_scopes', ['scopes' => $scopes]) ?>
        </div>
    </div>

    <?php if (!$primarySearch): ?>
        <?= $this->makePartial('list_controls') ?>
    <?php endif ?>
</div>
