<!-- Widget -->
<?php
    $widget = $this->makeFilterScopeWidget($scope);
    $scopeForm = trim((string) $widget->renderForm());
?>
<?= $widget->render() ?>
<?php if ($scopeForm !== ''): ?>
    <template data-scope-form><?= $scopeForm ?></template>
<?php endif ?>
