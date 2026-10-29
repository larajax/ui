import { formatButtons } from './format.js';
import { blockButtons } from './blocks.js';
import { linkButtons } from './links.js';
import { mediaButtons } from './media.js';
import { tableButtons } from './tables.js';
import { toolButtons } from './tools.js';

/**
 * Built-in button definitions keyed by button code, the codes match the toolbar
 * button codes of earlier editors so saved toolbars keep working.
 */
export const buttonDefinitions = {
    ...formatButtons,
    ...blockButtons,
    ...linkButtons,
    ...mediaButtons,
    ...tableButtons,
    ...toolButtons
};

/**
 * customButtonDefinition adapts a registered button (label, icon, onClick, focus, undo) to a
 * button definition, where onClick receives the editor facade and errors are logged so a
 * faulty button cannot break the editor.
 */
export function customButtonDefinition(name, definition) {
    return {
        label: definition.label || name,
        icon: definition.icon || null,
        run: (re) => {
            if (definition.focus !== false) {
                re.editor.commands.focus();
            }

            try {
                if (definition.onClick) {
                    definition.onClick(re.facade);
                }
            }
            catch (error) {
                console.error('[richarea] Button "' + name + '" failed, buttons should use the editor facade methods.', error);
            }

            if (definition.undo) {
                re.facade.saveUndoStep();
            }
        }
    };
}
