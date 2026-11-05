<?php namespace Larajax\Ui\FormWidgets;

use Larajax\Ui\Classes\FormWidgetBase;
use Larajax\Ui\Helpers\Markdown;
use Larajax\Ui\Helpers\Input;
use Larajax\Ui\Facades\Ui;

/**
 * MarkdownEditor renders a markdown editor field.
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class MarkdownEditor extends FormWidgetBase
{
    //
    // Legacy properties
    //

    /**
     * @var string Display mode: split, tab.
     */
    public $mode = 'tab';

    /**
     * @var bool safeMode runs the rendered preview HTML through DOMPurify
     * before it is shown in the editor. Defaults to true.
     */
    public $safeMode = true;

    //
    // Configurable Properties
    //

    /**
     * @var bool sideBySide window by default.
     */
    public $sideBySide = false;

    /**
     * @var bool externalToolbar leaves the toolbar to the page, which draws it from the editor's
     * toolbar API once the field announces markdowneditor:ready.
     */
    public $externalToolbar = false;

    //
    // Object Properties
    //

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'markdown';

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->fillFromConfig([
            'mode',
            'safeMode',
            'sideBySide',
            'externalToolbar'
        ]);

        // @deprecated API
        if ($this->getConfig('safe', false)) {
            $this->safeMode = true;
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('markdowneditor');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['mode'] = $this->sideBySide ? 'split' : $this->mode;
        $this->vars['safeMode'] = $this->safeMode;
        $this->vars['sideBySide'] = $this->sideBySide;
        $this->vars['externalToolbar'] = $this->externalToolbar;
        $this->vars['toolbarButtons'] = static::getToolbarButtons();
        $this->vars['stretch'] = $this->formField->stretch;
        $this->vars['size'] = $this->formField->size;
        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $this->getLoadValue();
        $this->vars['readOnly'] = $this->formField->readOnly;
        $this->vars['disabled'] = $this->formField->disabled;
    }

    /**
     * getToolbarButtons returns the toolbar, each button with its EasyMDE name, title, icon markup and
     * icon class, and "|" between groups
     */
    public static function getToolbarButtons(): array
    {
        $buttons = [
            ['name' => 'bold', 'icon' => 'bold', 'title' => __('Bold')],
            ['name' => 'italic', 'icon' => 'italic', 'title' => __('Italic')],
            ['name' => 'strikethrough', 'icon' => 'strikethrough', 'title' => __('Strikethrough')],
            ['name' => 'heading-1', 'icon' => 'heading1', 'title' => __('Header 1')],
            ['name' => 'heading-2', 'icon' => 'heading2', 'title' => __('Header 2')],
            ['name' => 'heading-3', 'icon' => 'heading3', 'title' => __('Header 3')],
            '|',
            ['name' => 'code', 'icon' => 'codeBlock', 'title' => __('Code')],
            ['name' => 'quote', 'icon' => 'quote', 'title' => __('Quote')],
            ['name' => 'unordered-list', 'icon' => 'unorderedList', 'title' => __('Unordered List')],
            ['name' => 'ordered-list', 'icon' => 'orderedList', 'title' => __('Ordered List')],
            ['name' => 'clean-block', 'icon' => 'cleanBlock', 'title' => __('Clean Block')],
            '|',
            ['name' => 'link', 'icon' => 'link', 'title' => __('Link')],
            ['name' => 'image', 'icon' => 'image', 'title' => __('Image')],
            ['name' => 'table', 'icon' => 'table', 'title' => __('Table')],
            ['name' => 'horizontal-rule', 'icon' => 'horizontalRule', 'title' => __('Insert Horizontal Rule')],
            '|',
            ['name' => 'preview', 'icon' => 'preview', 'title' => __('Preview')],
            ['name' => 'side-by-side', 'icon' => 'sideBySide', 'title' => __('Side by Side')],
            ['name' => 'fullscreen', 'icon' => 'fullscreen', 'title' => __('Full Screen')],
        ];

        return array_map(function ($button) {
            if (!is_array($button)) {
                return $button;
            }

            $key = 'markdowneditor.'.$button['icon'];

            return [
                'name' => $button['name'],
                'title' => $button['title'],
                'icon' => (string) Ui::icon($key),
                'iconClass' => Ui::iconClass($key)
            ];
        }, $buttons);
    }

    public function onRefresh()
    {
        $value = (string) Input::post($this->getFieldName());
        $previewHtml = $this->safeMode
            ? Markdown::parseClean($value)
            : Markdown::parse($value);

        return [
            'preview' => $previewHtml
        ];
    }
}
