<!-- Date -->
<label class="form-control form-adorn form-adorn-end">
    <span class="form-adorn-icon" aria-hidden="true">
        <?= \Larajax\Ui\Facades\Ui::icon('datepicker.date') ?>
    </span>
    <input
        type="text"
        id="<?= $this->getId('date') ?>"
        class="form-ghost"
        autocomplete="off"
        <?= $field->getAttributes() ?>
        data-datepicker />
</label>
