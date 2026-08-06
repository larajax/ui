/*
 * Amber — entry script
 *
 * Per-widget modules register themselves with jax.registerControl() on import.
 * Heavy widgets should use dynamic import() inside the bundle rather than
 * being included here, so they only load when first encountered.
 *
 * Requires the larajax framework bundle to be loaded first so window.jax
 * is available.
 */

import './formwidgets/fileupload/fileupload.js';
import './formwidgets/relation/relation-quick-create.js';
import './widgets/list/list.js';
import './widgets/filter/filter.js';
