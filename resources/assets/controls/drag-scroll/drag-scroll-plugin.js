/*
 * DragScroll jQuery Plugin
 *
 * Opt-in $.fn.dragScroll() shim, outside ui.js, needs jQuery.
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
            var options = typeof option == 'object' && unwrapOptions(option);

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

    // jQuery object options are passed as elements
    function unwrapOptions(option) {
        var options = Object.assign({}, option);

        Object.keys(options).forEach(function(key) {
            if (options[key] instanceof $) {
                options[key] = options[key].get(0) || null;
            }
        });

        return options;
    }
}
