<?php namespace Larajax\Ui\FormWidgets;

use Larajax\Ui\Classes\FormWidgetBase;
use Markdown;

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
            'sideBySide'
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
        $this->vars['stretch'] = $this->formField->stretch;
        $this->vars['size'] = $this->formField->size;
        $this->vars['name'] = $this->getFieldName();
        $this->vars['value'] = $this->getLoadValue();
        $this->vars['readOnly'] = $this->formField->readOnly;
        $this->vars['disabled'] = $this->formField->disabled;
    }

    public function onRefresh()
    {
        $value = (string) post($this->getFieldName());
        $previewHtml = $this->safeMode
            ? Markdown::parseClean($value)
            : Markdown::parse($value);

        return [
            'preview' => $previewHtml
        ];
    }
}
