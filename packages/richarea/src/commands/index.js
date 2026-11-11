import { formatButtons } from './format.js';
import { blockButtons } from './blocks.js';
import { linkButtons } from './links.js';
import { mediaButtons } from './media.js';
import { tableButtons } from './tables.js';
import { toolButtons } from './tools.js';

/**
 * Built-in buttons by code, matching earlier editors' toolbar codes.
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
 * customButtonDefinition wraps a registered button, logging errors.
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
