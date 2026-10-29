<td class="list-checkbox nolink">
    <input
        class="check check-sm"
        type="checkbox"
        name="checked[]"
        value="<?= e($this->getColumnKey($record)) ?>"
        <?= $this->isRowChecked($record) ? 'checked' : '' ?>
        autocomplete="off" />
</td>
