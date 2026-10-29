import { Link as BaseLink } from '@tiptap/extension-link';

/**
 * Link keeps only the attributes a link was given, without the default target and rel
 * values of the base extension. It is not inclusive, so typing after a link continues as plain text.
 */
export const Link = BaseLink.extend({
    inclusive() {
        return false;
    },

    addOptions() {
        return {
            ...this.parent?.(),
            openOnClick: false,
            enableClickSelection: false,
            autolink: true,
            linkOnPaste: true,
            defaultProtocol: 'https',
            HTMLAttributes: {},
            isAllowedUri: linkProtocolValidator([])
        };
    }
});

/**
 * linkProtocolValidator accepts links using the extra protocols, such as page references, besides the default ones.
 */
export function linkProtocolValidator(protocols) {
    const names = protocols.map((name) => String(name).replace(/[^\w+.-]/g, '').replace(/[+.]/g, '\\$&')).filter(Boolean);
    const pattern = names.length ? new RegExp('^(' + names.join('|') + '):', 'i') : null;

    return (url, context) => (!!pattern && pattern.test(url || '')) || context.defaultValidate(url);
}
