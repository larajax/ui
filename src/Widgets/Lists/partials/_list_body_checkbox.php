<td class="list-checkbox nolink">
    <input
        class="check"
        type="checkbox"
        name="checked[]"
        value="<?= e($this->getColumnKey($record)) ?>"
        <?= $this->isRowChecked($record) ? 'checked' : '' ?>
        autocomplete="off" />
</td>
