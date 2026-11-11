/*
 * DragScroll
 *
 * Allows to scroll an element content in the horizontal or vertical directions. This script
 * doesn't use absolute positioning and relies on the scrollLeft/scrollTop DHTML properties.
 * The element width should be fixed with the CSS or JavaScript.
 *
 * An element that scrolls natively, with an overflow of auto or scroll along its direction, leaves
 * touch and the wheel along that direction to the browser, which keeps momentum, smooth scrolling
 * and overscroll, while the mouse drags it and the wheel across it scrolls it. The scroll classes
 * follow changes in the size of the element and its content, as well as the window.
 *
 * Events dispatched on the element:
 * - drag-scroll:start
 * - drag-scroll:drag
 * - drag-scroll:stop
 *
 * Options:
 * - start - callback function to execute when the drag starts
 * - drag - callback function to execute when the element is dragged
 * - stop - callback function to execute when the drag ends
 * - vertical - determines if the scroll direction is vertical, false by default
 * - scrollClassContainer - if specified, an element or element selector to apply the
 *   'scroll-before' and 'scroll-after' CSS classes, depending on whether the scrollable area is
 *   in its start or end
 * - scrollMarkerContainer - if specified, an element or element selector to inject scroll
 *   markers (span elements indicating whether scrolling is possible)
 * - useDrag - determines if dragging is allowed, true by default
 * - useNative - if native CSS is enabled via "mobile" on the HTML tag, false by default
 * - useScroll - determines if mouse wheel scrolling is allowed, true by default
 * - useComboScroll - determines if horizontal scroll should act as vertical, and vice versa, true by default
 * - dragSelector - restrict drag events to this selector
 * - scrollSelector - restrict scroll events to this selector
 *
 * Methods:
 * - dispose - clean up the instance
 * - isStart - determines if the scrollable area is in its start (left or top)
 * - isEnd - determines if the scrollable area is in its end (right or bottom)
 * - goToStart - moves the scrollable area to the start (left or top)
 * - goToElement - moves the scrollable area to an element, at once with a duration of 0,
 *   leaving the room the element's scroll-padding asks for
 * - pause - pauses drag and scroll
 * - resume - resumes drag and scroll
 */
'use strict';

export default class DragScroll {
    static DEFAULTS = {
        vertical: false,
        useDrag: true,
        useScroll: true,
        useNative: false,
        useComboScroll: true,
        scrollClassContainer: false,
        scrollMarkerContainer: false,
        scrollSelector: null,
        dragSelector: null,
        noScrollClasses: false,
        noOverScroll: false,
        dragClass: 'drag',
        start: function() {},
        drag: function() {},
        stop: function() {}
    };

    constructor(element, options) {
        this.options = Object.assign({}, DragScroll.DEFAULTS, options || {});

        this.el = element;
        this.scrollClassContainer = this.resolveElement(this.options.scrollClassContainer) || element;
        this.isScrollable = true;
        this.dragStart = 0;
        this.startOffset = 0;
        this.dragging = false;
        this.paused = false;
        this.touchDragStarted = false;
        this.eventCoordName = this.options.vertical ? 'pageY' : 'pageX';
        this.isNative = this.options.useNative && document.documentElement.classList.contains('mobile');
        this.isNativeTouch = this.isNative || this.scrollsNatively();
        this.resizeObserver = null;
        this.fixScrollClassesIntervalId = null;
        this.wheelUpdateTimer = null;
        this.markers = [];
        this.listeners = [];

        // Inject scroll markers
        if (this.options.scrollMarkerContainer) {
            const markerContainer = this.resolveElement(this.options.scrollMarkerContainer);
            if (markerContainer) {
                ['before', 'after'].forEach((position) => {
                    const marker = document.createElement('span');
                    marker.className = position + ' scroll-marker';
                    markerContainer.appendChild(marker);
                    this.markers.push(marker);
                });
            }
        }

        // Bind events
        this.scrollTarget = this.options.scrollSelector
            ? element.querySelector(this.options.scrollSelector) || element
            : element;

        this.onWheel = this.onWheel.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onClickCapture = this.onClickCapture.bind(this);
        this.fixScrollClasses = this.fixScrollClasses.bind(this);
        this.onScroll = () => this.fixScrollClasses();
        this.onResize = () => this.fixScrollClasses();

        this.listen(this.scrollTarget, 'wheel', this.onWheel);

        if (this.options.useDrag) {
            this.listen(element, 'mousedown', this.onMouseDown);
        }

        // A native scroll container leaves touch to the browser
        if (!this.isNativeTouch && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            this.listen(element, 'touchstart', this.onTouchStart);
        }

        // Suppress item clicks while dragging
        this.listen(element, 'click', this.onClickCapture, true);

        if (!this.options.noScrollClasses) {
            this.listen(element, 'scroll', this.onScroll);
            this.observeSize();
        }

        this.fixScrollClasses();
    }

    dispose() {
        clearTimeout(this.fixScrollClassesIntervalId);
        clearTimeout(this.wheelUpdateTimer);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        this.stopWindowListeners();

        this.listeners.forEach(([target, type, handler, opts]) => {
            target.removeEventListener(type, handler, opts);
        });
        this.listeners = [];

        this.markers.forEach((marker) => marker.remove());
        this.markers = [];

        this.scrollClassContainer = null;
        this.scrollTarget = null;
        this.el = null;
    }

    // Internal

    listen(target, type, handler, opts) {
        target.addEventListener(type, handler, opts);
        this.listeners.push([target, type, handler, opts]);
    }

    resolveElement(value) {
        if (!value) {
            return null;
        }
        return typeof value === 'string' ? document.querySelector(value) : value;
    }

    // Whether the element is a native scroll container along its direction
    scrollsNatively() {
        const overflow = getComputedStyle(this.el)[this.options.vertical ? 'overflowY' : 'overflowX'];

        return overflow === 'auto' || overflow === 'scroll';
    }

    // Scroll classes track element and content size, or the window
    observeSize() {
        if (typeof ResizeObserver === 'undefined') {
            this.listen(window, 'resize', this.onResize);
            return;
        }

        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(this.el);
        Array.from(this.el.children).forEach((child) => this.resizeObserver.observe(child));
    }

    // Room the element's scroll-padding keeps either side of an element scrolled into view, as for a fade
    scrollPadding() {
        const style = getComputedStyle(this.el),
            read = (side) => parseFloat(style.getPropertyValue('scroll-padding-' + side)) || 0;

        return this.options.vertical
            ? { before: read('top'), after: read('bottom') }
            : { before: read('left'), after: read('right') };
    }

    // Element position along the scroll axis, in content coordinates
    itemBounds(target) {
        const itemRect = target.getBoundingClientRect(),
            elRect = this.el.getBoundingClientRect();

        if (this.options.vertical) {
            const start = itemRect.top - elRect.top - this.el.clientTop + this.el.scrollTop;
            return { start, end: start + itemRect.height };
        }

        const start = itemRect.left - elRect.left - this.el.clientLeft + this.el.scrollLeft;
        return { start, end: start + itemRect.width };
    }

    matchesDragSelector(target) {
        if (!this.options.dragSelector) {
            return true;
        }
        return !!target.closest(this.options.dragSelector);
    }

    dispatch(name) {
        this.el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    }

    // The wheel delta in pixels, positive towards the end (right or bottom)
    getWheelDelta(delta, event) {
        const deltaFactor = event.deltaMode === 1 ? 40 : (event.deltaMode === 2 ? this.el.clientHeight : 1);

        return (delta || 0) * deltaFactor;
    }

    onWheel(event) {
        // Pinch and the browser's zoom send the wheel with a modifier
        if (!this.options.useScroll || this.paused || event.ctrlKey || event.metaKey) {
            return;
        }

        const offsetX = this.getWheelDelta(event.deltaX, event),
            offsetY = this.getWheelDelta(event.deltaY, event),
            along = this.options.vertical ? offsetY : offsetX,
            across = this.options.vertical ? offsetX : offsetY;

        // Native containers scroll their own axis, so only turn the cross wheel
        if (along && this.scrollsNatively()) {
            if (this.options.noOverScroll && (along < 0 ? this.isStart() : this.isEnd())) {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }

        const offset = along || (this.options.useComboScroll ? across : 0);
        if (!offset) {
            return;
        }

        const scrolled = this.scrollWheel(offset);
        if (scrolled) {
            event.preventDefault();
            event.stopPropagation();
        }
        else if (this.options.noOverScroll) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    onMouseDown(event) {
        if (this.paused || !this.isScrollable) {
            return;
        }

        // Don't prevent clicking inputs in the toolbar
        if (event.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) {
            return;
        }

        if (!this.matchesDragSelector(event.target)) {
            return;
        }

        this.startDrag(event);
        event.preventDefault();
    }

    onTouchStart(event) {
        if (this.paused) {
            return;
        }

        if (!this.matchesDragSelector(event.target)) {
            return;
        }

        if (event.touches.length === 1) {
            this.startDrag(event.touches[0]);
            this.touchDragStarted = true;

            // Non-passive window listener only while dragging
            window.addEventListener('touchmove', this.onTouchMove, { passive: false });

            event.stopPropagation();
        }
    }

    onClickCapture(event) {
        // Do not handle item clicks while dragging
        if (document.body.classList.contains(this.options.dragClass)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    startDrag(pointer) {
        this.dragStart = pointer[this.eventCoordName];
        this.startOffset = this.options.vertical ? this.el.scrollTop : this.el.scrollLeft;
        this.dragStartPageX = pointer.pageX;
        this.dragStartPageY = pointer.pageY;

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            window.addEventListener('touchend', this.onTouchEnd);
            window.addEventListener('touchcancel', this.onTouchEnd);
        }

        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {
        this.moveDrag(event);
        event.preventDefault();
    }

    onMouseUp(event) {
        const isClick = this.dragStartPageX === event.pageX && this.dragStartPageY === event.pageY;
        this.stopDrag(isClick);
        event.preventDefault();
    }

    onTouchMove(event) {
        if (!this.touchDragStarted) {
            return;
        }

        this.moveDrag(event.touches[0]);
        if (!this.isNative) {
            event.preventDefault();
        }
    }

    onTouchEnd() {
        this.stopDrag();
    }

    moveDrag(pointer) {
        const current = pointer[this.eventCoordName],
            offset = this.dragStart - current;

        if (Math.abs(offset) > 3) {
            if (!this.dragging) {
                this.dragging = true;
                this.dispatch('drag-scroll:start');
                this.options.start();
                document.body.classList.add(this.options.dragClass);
            }

            if (!this.isNative) {
                if (this.options.vertical) {
                    this.el.scrollTop = this.startOffset + offset;
                }
                else {
                    this.el.scrollLeft = this.startOffset + offset;
                }
            }

            this.fixScrollClasses(true);

            this.dispatch('drag-scroll:drag');
            this.options.drag();
        }
    }

    stopWindowListeners() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('touchcancel', this.onTouchEnd);
        window.removeEventListener('touchmove', this.onTouchMove, { passive: false });
    }

    stopDrag(click) {
        this.stopWindowListeners();
        this.touchDragStarted = false;
        this.dragging = false;

        if (click) {
            document.body.classList.remove(this.options.dragClass);
        }
        else {
            this.fixScrollClasses();
        }

        window.setTimeout(() => {
            if (!click) {
                document.body.classList.remove(this.options.dragClass);
                this.dispatch('drag-scroll:stop');
                this.options.stop();
                this.fixScrollClasses();
            }
        }, 100);
    }

    scrollWheel(offset) {
        if (this.paused) {
            return false;
        }

        const el = this.el;

        this.startOffset = this.options.vertical ? el.scrollTop : el.scrollLeft;

        if (this.options.vertical) {
            el.scrollTop = this.startOffset + offset;
        }
        else {
            el.scrollLeft = this.startOffset + offset;
        }

        const scrolled = this.options.vertical
            ? el.scrollTop !== this.startOffset
            : el.scrollLeft !== this.startOffset;

        this.dispatch('drag-scroll:drag');
        this.options.drag();

        if (scrolled) {
            clearTimeout(this.wheelUpdateTimer);
            this.wheelUpdateTimer = window.setTimeout(() => {
                this.wheelUpdateTimer = null;
                this.fixScrollClasses();
            }, 100);
        }

        return scrolled;
    }

    // Public

    fixScrollClasses(isThrottle) {
        if (this.options.noScrollClasses) {
            return;
        }

        if (this.fixScrollClassesIntervalId) {
            if (isThrottle) {
                return;
            }

            clearTimeout(this.fixScrollClassesIntervalId);
            this.fixScrollClassesIntervalId = null;
        }

        this.fixScrollClassesIntervalId = window.setTimeout(() => {
            this.fixScrollClassesIntervalId = null;

            if (!this.el || !this.scrollClassContainer) {
                return;
            }

            const isStart = this.isStart(),
                isEnd = this.isEnd();

            this.scrollClassContainer.classList.toggle('scroll-before', !isStart);
            this.scrollClassContainer.classList.toggle('scroll-after', !isEnd);

            this.scrollClassContainer.classList.toggle('scroll-active-before', this.isActiveBefore());
            this.scrollClassContainer.classList.toggle('scroll-active-after', this.isActiveAfter());
            this.isScrollable = !isStart || !isEnd;
        }, 30);
    }

    isStart() {
        if (!this.options.vertical) {
            return this.el.scrollLeft <= 0;
        }
        return this.el.scrollTop <= 0;
    }

    isEnd() {
        // Fudge factor for retina displays
        const offset = 1;

        if (!this.options.vertical) {
            return this.el.scrollWidth - (this.el.scrollLeft + this.el.clientWidth) - offset <= 0;
        }
        return this.el.scrollHeight - (this.el.scrollTop + this.el.clientHeight) - offset <= 0;
    }

    goToStart() {
        if (!this.options.vertical) {
            this.el.scrollLeft = 0;
        }
        else {
            this.el.scrollTop = 0;
        }
    }

    /*
     * Determines if the element with the class 'active' is hidden after the viewport -
     * on the right or on the bottom.
     */
    isActiveAfter() {
        const activeElement = this.el.querySelector('.active');
        if (!activeElement) {
            return false;
        }

        const { start } = this.itemBounds(activeElement);
        if (!this.options.vertical) {
            return start > this.el.scrollLeft + this.el.clientWidth;
        }
        return start > this.el.scrollTop + this.el.clientHeight;
    }

    /*
     * Determines if the element with the class 'active' is hidden before the viewport -
     * on the left or on the top.
     */
    isActiveBefore() {
        const activeElement = this.el.querySelector('.active');
        if (!activeElement) {
            return false;
        }

        const { end } = this.itemBounds(activeElement);
        return end < (this.options.vertical ? this.el.scrollTop : this.el.scrollLeft);
    }

    goToElement(element, callback, options) {
        const target = this.resolveElement(element);
        if (!target) {
            return;
        }

        const params = Object.assign({
            duration: 300,
            alignBottom: false
        }, options || {});

        const vertical = this.options.vertical,
            prop = vertical ? 'scrollTop' : 'scrollLeft',
            current = this.el[prop],
            size = vertical ? this.el.clientHeight : this.el.clientWidth,
            max = (vertical ? this.el.scrollHeight : this.el.scrollWidth) - size,
            { start, end } = this.itemBounds(target),
            { before, after } = this.scrollPadding(),
            // Leave an item's height of room after a vertical target
            room = vertical && params.alignBottom ? end - start : 0;

        let offset = null;

        if (start - before < current) {
            offset = start - before;
        }
        else if (end + after + room > current + size) {
            offset = end + after + room - size;
        }

        // Stops at the ends, where the padding has no more to give
        if (offset !== null) {
            offset = Math.max(0, Math.min(offset, max));
        }

        const destination = offset === null || Math.abs(offset - current) < 1 ? null : { [prop]: offset };

        if (!destination) {
            if (callback !== undefined) {
                callback();
            }
            return;
        }

        if (params.duration <= 0) {
            this.el[prop] = destination[prop];
            this.fixScrollClasses();
            if (callback !== undefined) {
                callback();
            }
            return;
        }

        this.animateScroll(destination, params.duration, () => {
            this.fixScrollClasses();
            if (callback !== undefined) {
                callback();
            }
        });
    }

    animateScroll(destination, duration, complete) {
        const el = this.el,
            prop = destination.scrollLeft !== undefined ? 'scrollLeft' : 'scrollTop',
            from = el[prop],
            to = destination[prop],
            startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1),
                eased = 1 - Math.pow(1 - progress, 3);

            el[prop] = from + (to - from) * eased;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
            else {
                complete();
            }
        };

        requestAnimationFrame(step);
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
}
