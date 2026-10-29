export const toolButtons = {
    undo: {
        label: 'undo',
        shortcut: 'Mod-z',
        isDisabled: (re) => !re.editor.can().undo(),
        run: (re) => re.editor.chain().focus().undo().run()
    },

    redo: {
        label: 'redo',
        shortcut: 'Mod-Shift-z',
        isDisabled: (re) => !re.editor.can().redo(),
        run: (re) => re.editor.chain().focus().redo().run()
    },

    selectAll: {
        label: 'selectAll',
        shortcut: 'Mod-a',
        run: (re) => re.editor.chain().focus().selectAll().run()
    },

    html: {
        label: 'html',
        availableInSource: true,
        isActive: (re) => re.sourceView.isActive(),
        run: (re) => re.sourceView.toggle()
    },

    fullscreen: {
        label: 'fullscreen',
        availableInSource: true,
        availableReadOnly: true,
        getIcon: (re) => re.options.icons[re.isFullscreen ? 'fullscreenExit' : 'fullscreen'],
        isActive: (re) => re.isFullscreen,
        run: (re) => re.toggleFullscreen()
    }
};
