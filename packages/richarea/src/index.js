/**
 * Entry point for RichArea, a rich text editor built on TipTap.
 */
import './styles/richarea.css';

export { RichArea } from './richarea.js';
export { RichAreaFacade } from './facade.js';
export { buttonDefinitions } from './commands/index.js';
export { defaultOptions } from './options.js';
export { defaultLang } from './lang.js';
export { defaultIcons } from './icons.js';
export { normalizeHtml } from './html/normalizer.js';
export { formatHtml } from './html/formatter.js';
export { Editor, Extension, Node, Mark } from '@tiptap/core';
