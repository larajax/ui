<?php namespace Larajax\Ui\FormWidgets;

use Larajax\Ui\Classes\FormWidgetBase;

/**
 * CodeEditor renders a field for editing code
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class CodeEditor extends FormWidgetBase
{
    //
    // Configurable Properties
    //

    /**
     * @var string language code to display (php, twig)
     */
    public $language = 'php';

    /**
     * @var bool showGutter determines whether the gutter is visible.
     */
    public $showGutter = true;

    /**
     * @var string wordWrap mode: off, fluid, 40, 80.
     */
    public $wordWrap = 'fluid';

    /**
     * @var string codeFolding mode: manual, markbegin, markbeginend.
     */
    public $codeFolding = 'manual';

    /**
     * @var bool autoClosing automatically close tags and special characters,
     * like quotation marks, parenthesis, or brackets.
     */
    public $autoClosing = true;

    /**
     * @var bool useSoftTabs indicates whether the the editor uses spaces for indentation.
     */
    public $useSoftTabs = true;

    /**
     * @var bool tabSize sets the size of the indentation.
     */
    public $tabSize = 4;

    /**
     * @var int fontSize sets the font size.
     */
    public $fontSize = 12;

    /**
     * @var int margin sets the editor margin size.
     */
    public $margin = 0;

    /**
     * @var string|null theme to use: vs, vs-dark, hc-black or hc-light, follows the page color mode when empty.
     */
    public $theme = null;

    /**
     * @var bool showInvisibles characters.
     */
    public $showInvisibles = false;

    /**
     * @var bool highlightActiveLine highlights the active line.
     */
    public $highlightActiveLine = true;

    /**
     * @var bool readOnly, if true, the editor is set to read-only mode
     */
    public $readOnly = false;

    /**
     * @var string autocompletion mode: manual, basic, live.
     */
    public $autocompletion = 'manual';

    /**
     * @var bool enableSnippets ,if true, the editor activate use Snippets
     */
    public $enableSnippets = true;

    /**
     * @var bool displayIndentGuides, if true, the editor show Indent Guides
     */
    public $displayIndentGuides = true;

    /**
     * @var bool showPrintMargin, if true, the editor show Print Margin
     */
    public $showPrintMargin = false;

    //
    // Object Properties
    //

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'codeeditor';

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->applyEditorPreferences();

        $this->fillFromConfig([
            'language',
            'showGutter',
            'wordWrap',
            'codeFolding',
            'autoClosing',
            'useSoftTabs',
            'tabSize',
            'fontSize',
            'margin',
            'theme',
            'showInvisibles',
            'highlightActiveLine',
            'readOnly',
            'autocompletion',
            'enableSnippets',
            'displayIndentGuides',
            'showPrintMargin'
        ]);

        // The field config always carries readOnly, so a disabled field applies after it
        if ($this->formField->disabled) {
            $this->readOnly = true;
        }

        // Normalize boolean values for wordWrap
        if ($this->wordWrap === true || $this->wordWrap === '1') {
            $this->wordWrap = 'fluid';
        }
        elseif ($this->wordWrap === false || $this->wordWrap === '0') {
            $this->wordWrap = 'off';
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('codeeditor');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->vars['fontSize'] = $this->fontSize;
        $this->vars['wordWrap'] = $this->wordWrap;
        $this->vars['codeFolding'] = $this->codeFolding;
        $this->vars['autoClosing'] = $this->autoClosing;
        $this->vars['tabSize'] = $this->tabSize;
        $this->vars['theme'] = $this->theme;
        $this->vars['showInvisibles'] = $this->showInvisibles;
        $this->vars['highlightActiveLine'] = $this->highlightActiveLine;
        $this->vars['useSoftTabs'] = $this->useSoftTabs;
        $this->vars['showGutter'] = $this->showGutter;
        $this->vars['language'] = $this->language;
        $this->vars['margin'] = $this->margin;
        $this->vars['stretch'] = $this->formField->stretch;
        $this->vars['size'] = $this->formField->size;
        $this->vars['readOnly'] = $this->readOnly;
        $this->vars['autocompletion'] = $this->autocompletion;
        $this->vars['enableSnippets'] = $this->enableSnippets;
        $this->vars['displayIndentGuides'] = $this->displayIndentGuides;
        $this->vars['showPrintMargin'] = $this->showPrintMargin;

        $this->vars['value'] = $this->getLoadValue();
        $this->vars['name'] = $this->getFieldName();
    }

    /**
     * applyEditorPreferences sets the editor defaults from the user's editor preferences, before the field config applies.
     */
    protected function applyEditorPreferences()
    {
    }
}
