/*
 * Larajax UI - entry script
 *
 * Modules register themselves with jax.registerControl() on import. Imports
 * are layered: generic controls first, then widgets that build on them.
 * Heavy widgets should use dynamic import() inside the bundle rather than
 * being included here, so they only load when first encountered.
 *
 * Requires the larajax framework bundle to be loaded first so window.jax
 * is available.
 */

// Controls
import './controls/loader-container/loader-container-control.js';
import './controls/search-input/search-input-control.js';
import './controls/custom-select/custom-select-control.js';
import './controls/popover/popover.js';
import './controls/popup/popup.js';
import './controls/tab/tab.js';
import './controls/datepicker/datepicker.js';
import './controls/input-preset/input-preset.js';
import './controls/input-hotkey/hotkey-control.js';
import './controls/input-trigger/input-trigger-control.js';
import './controls/change-monitor/change-monitor-control.js';
import './controls/drag-scroll/drag-scroll-control.js';
import './controls/toolbar/toolbar-control.js';
import './controls/rowlink/rowlink-control.js';
import './controls/checkbox/checkbox-control.js';
import './controls/checkbox/checkbox-range.js';
import './controls/dropdown/dropdown.js';

// Widgets
import './widgets/list/list.js';
import './widgets/filter/filter.js';
import './widgets/liststructure/liststructure.js';

// Form widgets
import './formwidgets/fileupload/fileupload.js';
import './formwidgets/repeater/repeater-accordion.js';
import './formwidgets/repeater/repeater-builder.js';

