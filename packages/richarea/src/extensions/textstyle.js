import { TextStyle as BaseTextStyle } from '@tiptap/extension-text-style';

/**
 * Style properties the text style mark keeps; others are ignored.
 */
const SUPPORTED_PROPERTIES = ['color', 'background-color', 'font-family', 'font-size'];

/**
 * TextStyle claims only spans with supported styles; others unwrap.
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
