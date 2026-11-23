<!-- Template for the crop popup -->
<script type="text/template" id="<?= $this->getId('cropTemplate') ?>">
    <div class="image-cropper-popup" data-popup-size="large">
        <div class="dialog-header">
            <h4 class="dialog-title"><?= e(__("Crop Image")) ?></h4>
            <button type="button" class="btn-close" data-dismiss="popup" aria-label="<?= e(__("Close")) ?>"></button>
        </div>
        <div class="dialog-body">
            <p><?= e(__("Drag the image to position it, and zoom to choose how much of it to keep.")) ?></p>

            <div
                data-cropper-stage
                data-label="<?= e(__("The part of the image to keep. The arrow keys move it, plus and minus zoom.")) ?>"
            ></div>

            <div class="image-cropper-zoom">
                <label for="<?= $this->getId('cropZoom') ?>"><?= e(__("Zoom")) ?></label>
                <div class="form-range">
                    <input type="range" class="form-range-input" id="<?= $this->getId('cropZoom') ?>" min="0" max="100" value="0" data-cropper-zoom />
                </div>
                <span class="image-cropper-output" data-cropper-output></span>
            </div>

            <p class="image-cropper-warning" data-cropper-small hidden>
                <?= e(__("This part of the image is smaller than :size pixels, so it may look blurry.", [
                    'size' => round($cropWidth / 2).' × '.round($cropHeight / 2)
                ])) ?>
            </p>
            <p class="image-cropper-note" data-cropper-animated hidden>
                <?= e(__("Cropping keeps only the first frame of an animated image.")) ?>
            </p>
        </div>
        <div class="dialog-footer">
            <button type="button" class="btn-solid theme-primary" data-cropper-apply>
                <?= e(__("Crop")) ?>
            </button>
            <span class="button-separator"><?= e(__("or")) ?></span>
            <button type="button" class="btn-link fg-3" data-dismiss="popup">
                <?= e(__("Cancel")) ?>
            </button>
        </div>
    </div>
</script>
