<!-- Template for new file -->
<script type="text/template" id="<?= $this->getId('template') ?>">
    <div class="upload-object upload-object-file dz-preview dz-file-preview <?= isset($modeMulti) ? 'mode-multi' : '' ?>">
        <?php if (isset($modeMulti)): ?>
            <div class="form-check">
                <input
                    class="form-check-input"
                    data-record-selector
                    type="checkbox"
                    value=""
                />
            </div>
            <div class="drag-handle">
                <?= \Larajax\Ui\Facades\Ui::icon('fileupload.reorder') ?>
            </div>
        <?php endif ?>

        <div class="file-data-container">
            <div class="file-data-container-inner">
                <div class="icon-container">
                    <?= \Larajax\Ui\Facades\Ui::icon('fileupload.attachment') ?>
                </div>

                <div class="info">
                    <h4 class="filename">
                        <span data-dz-name></span>
                        <p class="size" data-dz-size></p>
                    </h4>
                </div>
                <p class="description" data-description></p>
                <div class="meta">
                    <div class="progress-bar"><span class="upload-progress" data-dz-uploadprogress></span></div>
                    <div class="error-message"><span data-dz-errormessage></span></div>
                </div>
            </div>
        </div>
    </div>
</script>
