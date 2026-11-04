<?php
/**
 * Shared theme processing for button views.
 *
 * Reads the theme flags ($primary, $secondary, $danger, $success, $warning, $info) and $outline,
 * any of which may be unset. Produces $classes, the button's variant and theme classes. The first
 * theme flag set wins, outline without a theme is secondary, and no flag leaves a plain button.
 */
$outline ??= false;

$theme = match (true) {
    !empty($primary) => 'primary',
    !empty($secondary) => 'secondary',
    !empty($danger) => 'danger',
    !empty($success) => 'success',
    !empty($warning) => 'warning',
    !empty($info) => 'info',
    $outline => 'secondary',
    default => null,
};

$classes = $theme
    ? [$outline ? 'btn-outline' : 'btn-solid', 'theme-'.$theme]
    : ['btn'];
