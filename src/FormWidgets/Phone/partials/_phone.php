<?php if ($this->previewMode): ?>
    <span id="<?= $this->getId() ?>" class="form-control">
        <?php if (strlen($value)): ?>
            <a
                href="tel:<?= e($value) ?>"
                data-control="phone-input"
                data-phone-value="<?= e($value) ?>"
                data-default-country="<?= e($defaultCountry) ?>"
            >
                <?= e($value) ?>
            </a>
        <?php else: ?>
            &nbsp;
        <?php endif ?>
    </span>
<?php else: ?>
    <div
        id="<?= $this->getId() ?>"
        class="field-phone"
        data-control="phone-input"
        data-default-country="<?= e($defaultCountry) ?>"
        <?php if ($countries !== null): ?>data-countries="<?= e(json_encode($countries)) ?>"<?php endif ?>
        <?php if ($preferredCountries): ?>data-preferred-countries="<?= e(json_encode($preferredCountries)) ?>"<?php endif ?>
        <?= $this->formField->getAttributes() ?>
    >
        <div class="form-control form-adorn">
            <button
                type="button"
                class="combobox-toggle phone-country"
                data-bs-toggle="combobox"
                data-bs-strategy="fixed"
                aria-haspopup="listbox"
                aria-expanded="false"
                data-phone-country
                <?= $readOnly || $disabled ? 'disabled' : '' ?>
            >
                <span class="<?= $defaultCountry ? 'flag-'.e(strtolower($defaultCountry)) : '' ?>" aria-hidden="true" data-phone-flag></span>
                <span aria-hidden="true" data-phone-dial-code></span>
                <span class="visually-hidden">
                    <?= e(__('Country')) ?>:
                </span>
                <span class="combobox-value visually-hidden">
                    <?= e($defaultCountry) ?>
                </span>
                <?= \Larajax\Ui\Facades\Ui::icon('dropdown.caret', ['class' => 'combobox-caret']) ?>
            </button>
            <div class="menu phone-countries" role="listbox" data-phone-countries></div>
            <input
                type="tel"
                id="<?= $inputId ?>"
                value="<?= e($value) ?>"
                placeholder="<?= e(__($this->formField->placeholder)) ?>"
                class="form-ghost"
                autocomplete="tel"
                data-phone-input
                <?php if ($disabled): ?>disabled<?php elseif ($readOnly): ?>readonly<?php endif ?>
            />
        </div>
        <input
            type="hidden"
            name="<?= $name ?>"
            value="<?= e($value) ?>"
            data-phone-value
            <?= $disabled ? 'disabled' : '' ?>
        />
    </div>
<?php endif ?>
