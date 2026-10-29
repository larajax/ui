import { TextStyle as BaseTextStyle } from '@tiptap/extension-text-style';

/**
 * Style properties the text style mark stores, other span styles are ignored.
 */
const SUPPORTED_PROPERTIES = ['color', 'background-color', 'font-family', 'font-size'];

/**
 * TextStyle only claims spans carrying a supported style property, so spans styled with
 * anything else are unwrapped instead of saved as empty span tags.
 */
export const TextStyle = BaseTextStyle.extend({
    parseHTML() {
        return [
            {
                tag: 'span',
                consuming: false,
                getAttrs: (element) => {
                    const style = element.style;
                    return SUPPORTED_PROPERTIES.some((name) => style.getPropertyValue(name)) ? {} : false;
                }
            }
        ];
    }
});
