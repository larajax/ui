/*
 * Amber - entry script
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
import './controls/popover/popover.js';
import './controls/popup/popup.js';

// Widgets
import './widgets/list/list.js';
import './widgets/filter/filter.js';
import './widgets/liststructure/liststructure.js';

// Form widgets
import './formwidgets/fileupload/fileupload.js';

