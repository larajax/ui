<?php
    $transportMethod = $pageName === '_page' ? 'data' : 'query';
?>
<div class="list-pagination">
    <div class="list-pagination-summary text-muted me-auto">
        <?= e(__('records :from to :to of :total', ['from' => $pageFrom, 'to' => $pageTo, 'total' => $recordTotal])) ?>
    </div>
    <?php if ($pageLast > 1): ?>
        <nav class="list-pagination-links loading-indicator-container size-small">
            <ul class="pagination">
                <?php if ($pageCurrent > 1): ?>
                    <li class="page-item">
                        <a
                            href="javascript:;"
                            class="page-link page-first"
                            data-request="<?= $this->getEventHandler('onPaginate') ?>"
                            data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: 1 }"
                            data-load-indicator="<?= e(__('Loading...')) ?>"
                            title="<?= e(__('First page')) ?>">
                            <i class="icon-angle-double-left"></i>
                        </a>
                    </li>
                <?php else: ?>
                    <li class="page-item disabled">
                        <span
                            class="page-link page-first"
                            title="<?= e(__('First page')) ?>">
                            <i class="icon-angle-double-left"></i>
                        </span>
                    </li>
                <?php endif ?>
                <?php if ($pageCurrent > 1): ?>
                    <li class="page-item">
                        <a
                            href="javascript:;"
                            class="page-link page-back"
                            data-request="<?= $this->getEventHandler('onPaginate') ?>"
                            data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: <?= $pageCurrent - 1 ?> }"
                            data-load-indicator="<?= e(__('Loading...')) ?>"
                            title="<?= e(__('Previous page')) ?>">
                            <i class="icon-angle-left"></i>
                        </a>
                    </li>
                <?php else: ?>
                    <li class="page-item disabled">
                        <span
                            class="page-link page-back"
                            title="<?= e(__('Previous page')) ?>">
                            <i class="icon-angle-left"></i>
                        </span>
                    </li>
                <?php endif ?>
                <?php foreach ($recordElements as $element): ?>
                    <?php if (is_string($element)): ?>
                        <li class="page-item page-choose">
                            <a
                                href="javascript:;"
                                id="<?= $this->getId('pageChooser') ?>"
                                class="page-link page-dots"
                                data-control="popover"
                                data-content-from="#<?= $this->getId('pageChooserPopover') ?>"
                                data-fallback-placement="left"
                                data-load-indicator="<?= e(__('Loading...')) ?>">
                                <?= e($element) ?>
                            </a>
                        </li>
                    <?php elseif (is_array($element)): ?>
                        <?php foreach ($element as $page => $url): ?>
                            <?php if ($page === $pageCurrent): ?>
                                <li class="page-item active">
                                    <span class="page-link page-active">
                                        <?= $page ?>
                                    </span>
                                </li>
                            <?php else: ?>
                                <li class="page-item">
                                    <a
                                        href="javascript:;"
                                        class="page-link page-back"
                                        data-request="<?= $this->getEventHandler('onPaginate') ?>"
                                        data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: <?= $page ?> }"
                                        data-load-indicator="<?= e(__('Loading...')) ?>"
                                    >
                                        <?= $page ?>
                                    </a>
                                </li>
                            <?php endif ?>
                        <?php endforeach ?>
                    <?php endif ?>
                <?php endforeach ?>
                <?php if ($pageLast > $pageCurrent): ?>
                    <li class="page-item">
                        <a
                            href="javascript:;"
                            class="page-link page-next"
                            data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: <?= $pageCurrent + 1 ?> }"
                            data-request="<?= $this->getEventHandler('onPaginate') ?>"
                            data-load-indicator="<?= e(__('Loading...')) ?>"
                            title="<?= e(__('Next page')) ?>">
                            <i class="icon-angle-right"></i>
                        </a>
                    </li>
                <?php else: ?>
                    <li class="page-item disabled">
                        <span
                            class="page-link page-next"
                            title="<?= e(__('Next page')) ?>">
                            <i class="icon-angle-right"></i>
                        </span>
                    </li>
                <?php endif ?>
                <?php if ($pageLast > $pageCurrent): ?>
                    <li class="page-item">
                        <a
                            href="javascript:;"
                            class="page-link page-last"
                            data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: <?= $pageLast ?> }"
                            data-request="<?= $this->getEventHandler('onPaginate') ?>"
                            data-load-indicator="<?= e(__('Loading...')) ?>"
                            title="<?= e(__('Last page')) ?>">
                            <i class="icon-angle-double-right"></i>
                        </a>
                    </li>
                <?php else: ?>
                    <li class="page-item disabled">
                        <span
                            class="page-link page-last"
                            title="<?= e(__('Last page')) ?>">
                            <i class="icon-angle-double-right"></i>
                        </span>
                    </li>
                <?php endif ?>
            </ul>
        </nav>
    <?php endif ?>
</div>
<script type="text/template" id="<?= $this->getId('pageChooserPopover') ?>">
    <div class="popover-body">
        <form
            data-list-page-chooser
            data-chooser-id="<?= $this->getId('pageChooser') ?>"
            data-handler="<?= $this->getEventHandler('onPaginate') ?>"
            class="control-list-page-chooser">
            <div class="input-group flex-nowrap">
                <span class="input-group-text"><?= __('Go to page') ?></span>
                <input
                    type="number"
                    value=""
                    name="<?= e($pageName) ?>"
                    autocomplete="off"
                    class="form-control input-no-spinner"
                    style="width: 75px"
                    data-chooser-input
                    data-popover-autofocus />
                <button
                    type="submit"
                    class="btn btn-primary">
                    <?= __("Go") ?>
                </button>
            </div>
        </form>
    </div>
</script>
