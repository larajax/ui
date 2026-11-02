<?php
    $activeScopes = array_filter($scopes, fn ($scope) => match ($scope->type) {
        'checkbox', 'switch' => $scope->scopeValue !== null && (bool) $scope->value,
        'dropdown' => $scope->scopeValue !== null && $scope->value !== null && $scope->value !== '',
        default => (bool) $scope->scopeValue,
    });
?>
<?php foreach ($activeScopes + $scopes as $scope): ?>
    <?= $this->makePartial('scope-container', ['scope' => $scope]) ?>
<?php endforeach ?>
