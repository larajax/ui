<?php
    $transportMethod = $pageName === '_page' ? 'data' : 'query';
?>
<div class="list-pagination">
    <nav class="list-pagination-links ms-auto loading-indicator-container size-small">
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
                        <?= \Larajax\Ui\Facades\Ui::icon('pagination.first') ?>
                    </a>
                </li>
            <?php else: ?>
            <li class="page-item disabled">
                <span
                    class="page-link page-first"
                    title="<?= e(__('First page')) ?>">
                    <?= \Larajax\Ui\Facades\Ui::icon('pagination.first') ?>
                </span>
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
                        <?= \Larajax\Ui\Facades\Ui::icon('pagination.previous') ?>
                    </a>
                </li>
            <?php else: ?>
                <li class="page-item disabled">
                    <span
                        class="page-link page-back"
                        title="<?= e(__('Previous page')) ?>">
                        <?= \Larajax\Ui\Facades\Ui::icon('pagination.previous') ?>
                    </span>
                </li>
            <?php endif ?>
            <li class="page-item active">
                <span class="page-link page-active">
                    <?= $pageCurrent ?>
                </span>
            </li>
            <?php if ($hasMorePages): ?>
                <li class="page-item">
                    <a
                        href="javascript:;"
                        class="page-link page-next"
                        data-request-<?= $transportMethod ?>="{ <?= e($pageName) ?>: <?= $pageCurrent + 1 ?> }"
                        data-request="<?= $this->getEventHandler('onPaginate') ?>"
                        data-load-indicator="<?= e(__('Loading...')) ?>"
                        title="<?= e(__('Next page')) ?>">
                        <?= \Larajax\Ui\Facades\Ui::icon('pagination.next') ?>
                    </a>
                </li>
            <?php else: ?>
                <li class="page-item disabled">
                    <span
                        class="page-link page-next"
                        title="<?= e(__('Next page')) ?>">
                        <?= \Larajax\Ui\Facades\Ui::icon('pagination.next') ?>
                    </span>
                </li>
            <?php endif ?>
        </ul>
    </nav>
</div>
