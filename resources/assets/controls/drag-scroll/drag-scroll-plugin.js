/*
 * DragScroll jQuery Plugin
 *
 * Backward compatibility shim for the $.fn.dragScroll() API. This is an
 * opt-in compatibility layer: it is not part of the ui.js bundle and only
 * registers when jQuery is present on the page.
 */
import DragScroll from './drag-scroll.js';

const $ = window.jQuery;

if ($) {
    const old = $.fn.dragScroll;

    $.fn.dragScroll = function(option) {
        var args = arguments;

        return this.each(function() {
            var $this = $(this);
            var data = $this.data('oc.dragScroll');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('oc.dragScroll', (data = new DragScroll(this, options)));
            if (typeof option == 'string') {
                var methodArgs = [];
                for (var i = 1; i < args.length; i++) methodArgs.push(args[i]);

                data[option].apply(data, methodArgs);
            }
        });
    };

    $.fn.dragScroll.Constructor = DragScroll;

    $.fn.dragScroll.noConflict = function() {
        $.fn.dragScroll = old;
        return this;
    };
}
