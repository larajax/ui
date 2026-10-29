import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Stylesheets are never fetched, they report a load so controls waiting for one carry on
GlobalRegistrator.register({ settings: { disableCSSFileLoading: true, handleDisabledFileLoadingAsSuccess: true } });
