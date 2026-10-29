<?php namespace Larajax\Ui\FormWidgets;

use Larajax\Ui\Classes\FormField;
use Larajax\Ui\Classes\FormWidgetBase;
use October\Rain\Exception\ValidationException;
use October\Rain\Html\Helper as HtmlHelper;

/**
 * NestedForm widget
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
class NestedForm extends FormWidgetBase
{
    use \Larajax\Ui\Traits\FormModelSaver;
    use \Larajax\Ui\Traits\FormModelWidget;

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'nestedform';

    /**
     * @var array form configuration
     */
    public $form;

    /**
     * @var bool showPanel defines if the nested form is styled like a panel
     */
    public $showPanel = true;

    /**
     * @var bool defaultCreate will create a new record when the form loads, useful
     * for associating relations within the nested form
     */
    public $defaultCreate = false;

    /**
     * @var bool useRelation will instruct the widget to look for a relationship
     */
    protected $useRelation = false;

    /**
     * @var \Larajax\Ui\Widgets\Form formWidget reference
     */
    protected $formWidget;

    /**
     * @var \Model relatedRecord when using a relation
     */
    protected $relatedRecord;

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->fillFromConfig([
            'form',
            'showPanel',
            'defaultCreate'
        ]);

        if ($this->formField->disabled) {
            $this->previewMode = true;
        }

        $this->processRelationMode();

        $this->makeNestedFormWidget();
    }

    /**
     * @inheritdoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('nestedform');
    }

    /**
     * prepareVars for display
     */
    public function prepareVars()
    {
        $this->formWidget->previewMode = $this->previewMode;
    }


    /**
     * @inheritDoc
     */
    public function getSaveValue($value)
    {
        if ($this->useRelation) {
            return $this->processSaveForRelation($value);
        }

        return $this->formWidget->getSaveData();
    }

    /**
     * resetFormValue from the form field
     */
    public function resetFormValue()
    {
        $this->formWidget->setFormValues($this->formField->value);
    }

    /**
     * processSaveForRelation
     * @param array $value
     * @return array|null
     */
    protected function processSaveForRelation($value)
    {
        // Give form field widgets an opportunity to process the data
        $widget = $this->formWidget;
        $saveData = $widget->getSaveData();

        // Save data to the model
        $model = $widget->model;

        $modelsToSave = $this->prepareModelsToSave($model, $saveData);

        foreach ($modelsToSave as $attrChain => $modelToSave) {
            try {
                $modelToSave->save(['sessionKey' => $widget->getSessionKeyWithSuffix()]);
            }
            catch (ValidationException $ve) {
                $ve->setFieldPrefix(array_merge(
                    HtmlHelper::nameToArray($this->valueFrom),
                    $attrChain ? explode('.', $attrChain) : []
                ));
                throw $ve;
            }
        }

        return FormField::NO_SAVE_DATA;
    }

    /**
     * makeNestedFormWidget creates a form widget
     */
    protected function makeNestedFormWidget()
    {
        $config = $this->makeConfig($this->form);

        if ($this->useRelation) {
            $config->model = $this->getLoadValueFromRelation();
        }
        else {
            $config->model = $this->model;
            $config->data = $this->getLoadValue() ?: [];
            $config->isNested = true;
        }

        $config->alias = $this->alias . $this->defaultAlias;
        $config->context = $this->formField->context;
        $config->arrayName = $this->getFieldName();
        $config->sessionKey = $this->sessionKey;
        $config->sessionKeySuffix = $this->sessionKeySuffix;
        $config->parentFieldName = $this->formField->fieldName;

        $this->tagTabbedFormFields($config->tabs);
        $this->tagTabbedFormFields($config->secondaryTabs);

        $widget = $this->makeWidget(\Larajax\Ui\Widgets\Form::class, $config);
        $widget->previewMode = $this->previewMode;
        $widget->bindToController();

        $this->formWidget = $widget;
    }

    /**
     * tagTabbedFormFields adds is-nested CSS class to tabs
     */
    protected function tagTabbedFormFields(&$config)
    {
        if (!$config) {
            return;
        }

        if (isset($config['cssClass'])) {
            $config['cssClass'] = $config['cssClass'] . ' is-nested';
        }
        else {
            $config['cssClass'] = 'is-nested';
        }
    }

    /**
     * getLoadValueFromRelation
     */
    protected function getLoadValueFromRelation()
    {
        if ($this->relatedRecord !== null) {
            return $this->relatedRecord;
        }

        $relationObject = $this->getRelationObject();

        // Deferred bindings are a Rain concept; plain Eloquent reads directly
        $this->relatedRecord = method_exists($relationObject, 'withDeferred')
            ? $relationObject->withDeferred($this->getSessionKey())->first()
            : $relationObject->first();

        if (!$this->relatedRecord) {
            $this->relatedRecord = $this->createRelationByDefault();
        }

        return $this->relatedRecord;
    }

    /**
     * createRelationByDefault
     */
    protected function createRelationByDefault()
    {
        $model = $this->getRelationModel();

        if ($this->defaultCreate) {
            $model->save(['force' => true]);

            $relationObject = $this->getRelationObject();
            if (method_exists($relationObject, 'add')) {
                $relationObject->add($model, $this->getSessionKey());
            }
            elseif (method_exists($relationObject, 'associate')) {
                $relationObject->associate($model);
            }
            else {
                $relationObject->save($model);
            }
        }

        return $model;
    }

    /**
     * processRelationMode
     */
    protected function processRelationMode()
    {
        [$model, $attribute] = $this->nearestModelAttribute($this->valueFrom);

        if ($model && app('model.inspector')->hasRelation($model, $attribute)) {
            $this->useRelation = true;
        }
    }
}
