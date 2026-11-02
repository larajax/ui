<?php namespace Larajax\Ui\Widgets\Common;

use Larajax\Ui\Widgets\Lists;
use Larajax\Ui\Widgets\Search;

/**
 * Shared search configuration and list binding for toolbars and filters.
 */
trait HasListSearch
{
    /**
     * @var array|string|Search search configuration, partial name or widget instance.
     */
    public $search;

    /**
     * @var Search|null searchWidget reference.
     */
    protected $searchWidget;

    /**
     * initSearchWidget prepares and registers the optional search widget.
     */
    protected function initSearchWidget(): void
    {
        if (!isset($this->search)) {
            return;
        }

        if ($this->search instanceof Search) {
            $this->searchWidget = $this->search;
        }
        else {
            $config = is_string($this->search) ? ['partial' => $this->search] : $this->search;
            $config = $this->makeConfig($config);
            $config->alias = $this->alias.'Search';
            $this->searchWidget = $this->makeWidget(Search::class, $config);
        }

        $this->searchWidget->bindToController();
    }

    /**
     * bindSearchToListWidget applies saved search and refreshes the list on submit.
     */
    protected function bindSearchToListWidget(Lists $list): void
    {
        if (!$search = $this->getSearchWidget()) {
            return;
        }

        $list->setSearchOptions([
            'mode' => $search->mode,
            'scope' => $search->scope,
        ]);
        $list->setSearchTerm($search->getActiveTerm());

        $search->bindEvent('search.submit', function () use ($list, $search) {
            $list->setSearchTerm($search->getActiveTerm(), true);

            return $list->onRefresh();
        });
    }

    /**
     * getSearchWidget returns the configured search widget.
     */
    public function getSearchWidget()
    {
        return $this->searchWidget;
    }
}
