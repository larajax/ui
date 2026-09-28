/*
 * Larajax UI - browser entry (auto-registering)
 *
 * Registers every control and widget against the global framework instance,
 * so a page can load the published assets with no build step:
 *
 *     <script src="/vendor/larajax/framework-bundle.js"></script>
 *     <script type="module" src="/vendor/larajax/ui/ui.js"></script>
 *
 * Requires the Larajax framework bundle to be loaded first so window.jax is
 * available. Build tool consumers should import index.js and call
 * registerUi() with their own framework instance instead.
 */
'use strict';

import { registerUi } from './index.js';

if (!window.jax) {
    throw new Error('Larajax UI requires the Larajax framework bundle to load first.');
}

registerUi(window.jax);
