<!-- Time -->
<label class="form-control form-adorn form-adorn-end">
    <span class="form-adorn-icon" aria-hidden="true">
        <?= \Larajax\Ui\Facades\Ui::icon('datepicker.time') ?>
    </span>
    <input
        type="text"
        id="<?= $this->getId('time') ?>"
        class="form-ghost"
        autocomplete="off"
        <?= $field->getAttributes() ?>
        data-timepicker />
</label>
