<?php namespace Larajax\Ui\Traits;

use Log;
use October\Rain\Exception\ErrorHandler;
use October\Rain\Exception\ApplicationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * ErrorMaker Trait adds exception based methods to a class, goes well with `ViewMaker`
 *
 * @package larajax\ui
 * @author Alexey Bobkov, Samuel Georges
 */
trait ErrorMaker
{
    /**
     * @var string|null fatalError stores the object used for a fatal error.
     */
    protected $fatalError;

    /**
     * hasFatalError returns true if a fatal error has been set.
     */
    public function hasFatalError()
    {
        return !is_null($this->fatalError);
    }

    /**
     * getFatalError returns error message
     */
    public function getFatalError()
    {
        return $this->fatalError;
    }

    /**
     * handleError sets standard page variables in the case of a controller error.
     */
    public function handleError($exception)
    {
        if (
            !$exception instanceof ApplicationException &&
            !$exception instanceof ValidationException
        ) {
            Log::error($exception);
        }

        $errorMessage = $this->getDetailedErrorMessage($exception);
        $this->fatalError = $errorMessage;
        $this->vars['fatalError'] = $errorMessage;
    }

    /**
     * getDetailedErrorMessage returns the message to display for an exception, override to use the platform's error handler.
     */
    protected function getDetailedErrorMessage($exception): string
    {
        if ($exception instanceof NotFoundHttpException) {
            return $exception->getMessage() ?: __("Not Found");
        }

        if ($exception instanceof ValidationException) {
            return $exception->getMessage();
        }

        if (method_exists($exception, 'getSafeMessage')) {
            return $exception->getSafeMessage();
        }

        if (config('app.debug')) {
            return ErrorHandler::getDetailedMessage($exception);
        }

        return __("We're sorry, but something went wrong and the page cannot be displayed.");
    }
}
