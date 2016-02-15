(function() {
    'use strict';
    // CONSTANTS
    var STAGE = 'Stage',
        STRING = 'string',
        PX = 'px',

        MOUSEOUT = 'mouseout',
        MOUSELEAVE = 'mouseleave',
        MOUSEOVER = 'mouseover',
        MOUSEENTER = 'mouseenter',
        MOUSEMOVE = 'mousemove',
        MOUSEDOWN = 'mousedown',
        MOUSEUP = 'mouseup',
        CLICK = 'click',
        DBL_CLICK = 'dblclick',
        TOUCHSTART = 'touchstart',
        TOUCHEND = 'touchend',
        TAP = 'tap',
        DBL_TAP = 'dbltap',
        TOUCHMOVE = 'touchmove',
        DOMMOUSESCROLL = 'DOMMouseScroll',
        MOUSEWHEEL = 'mousewheel',
        WHEEL = 'wheel',

        CONTENT_MOUSEOUT = 'contentMouseout',
        CONTENT_MOUSEOVER = 'contentMouseover',
        CONTENT_MOUSEMOVE = 'contentMousemove',
        CONTENT_MOUSEDOWN = 'contentMousedown',
        CONTENT_MOUSEUP = 'contentMouseup',
        CONTENT_CLICK = 'contentClick',
        CONTENT_DBL_CLICK = 'contentDblclick',
        CONTENT_TOUCHSTART = 'contentTouchstart',
        CONTENT_TOUCHEND = 'contentTouchend',
        CONTENT_DBL_TAP = 'contentDbltap',
        CONTENT_TAP = 'contentTap',
        CONTENT_TOUCHMOVE = 'contentTouchmove',

        DIV = 'div',
        RELATIVE = 'relative',
        KONVA_CONTENT = 'konvajs-content',
        SPACE = ' ',
        UNDERSCORE = '_',
        CONTAINER = 'container',
        EMPTY_STRING = '',
        EVENTS = [MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEOUT, TOUCHSTART, TOUCHMOVE, TOUCHEND, MOUSEOVER, DOMMOUSESCROLL, MOUSEWHEEL, WHEEL],
        // cached variables
        eventsLength = EVENTS.length;


    Konva.Stage.prototype._touchstart = function(evt) {
        var changedTouches = evt.changedTouches;
        var cLength = changedTouches.length;
        for (var i=0; i < cLength; i++)
        {
            var touchEvent = changedTouches[i];
            
            var contentPosition = this._getContentPosition();
            this.pointerPos = {
                x: touchEvent.clientX - contentPosition.left,
                y: touchEvent.clientY - contentPosition.top
            };
            //this._setPointerPosition(evt);

            var shape = this.getIntersection(this.getPointerPosition());

            Konva.listenClickTap = true;

            if (shape && shape.isListening()) {
                this.tapStartShape = shape;
                shape._fireAndBubble(TOUCHSTART, {evt: evt});

                // only call preventDefault if the shape is listening for events
                if (shape.isListening() && evt.preventDefault) {
                    evt.preventDefault();
                }
            }
            // content event
            this._fire(CONTENT_TOUCHSTART, {evt: evt});
        }
    };
    
    Konva.Stage.prototype._touchend = function(evt) {
        var changedTouches = evt.changedTouches;
        var cLength = changedTouches.length;
        for (var i=0; i < cLength; i++)
        {
            var touchEvent = changedTouches[i];

            var contentPosition = this._getContentPosition();
            this.pointerPos = {
                x: touchEvent.clientX - contentPosition.left,
                y: touchEvent.clientY - contentPosition.top
            };
    
//            this._setPointerPosition(evt);
            var shape = this.getIntersection(this.getPointerPosition()),
                fireDblClick = false;

            if(Konva.inDblClickWindow) {
                fireDblClick = true;
                Konva.inDblClickWindow = false;
            }
            else {
                Konva.inDblClickWindow = true;
            }

            setTimeout(function() {
                Konva.inDblClickWindow = false;
            }, Konva.dblClickWindow);

            if (shape && shape.isListening()) {
                shape._fireAndBubble(TOUCHEND, {evt: evt});

                // detect if tap or double tap occurred
                if(Konva.listenClickTap && shape._id === this.tapStartShape._id) {
                    shape._fireAndBubble(TAP, {evt: evt});

                    if(fireDblClick) {
                        shape._fireAndBubble(DBL_TAP, {evt: evt});
                    }
                }
                // only call preventDefault if the shape is listening for events
                if (shape.isListening() && evt.preventDefault) {
                    evt.preventDefault();
                }
            }
            // content events
            this._fire(CONTENT_TOUCHEND, {evt: evt});
            if (Konva.listenClickTap) {
                this._fire(CONTENT_TAP, {evt: evt});
                if(fireDblClick) {
                    this._fire(CONTENT_DBL_TAP, {evt: evt});
                }
            }

            Konva.listenClickTap = false;
        }
    };
    
    Konva.Stage.prototype._touchmove = function(evt) {
        var changedTouches = evt.changedTouches;
        var cLength = changedTouches.length;
        for (var i=0; i < cLength; i++)
        {
            var touchEvent = changedTouches[i];
            var contentPosition = this._getContentPosition();
            this.pointerPos = {
                x: touchEvent.clientX - contentPosition.left,
                y: touchEvent.clientY - contentPosition.top
            };
            var dd = Konva.DD,
                shape;
            if (!Konva.isDragging()) {
                shape = this.getIntersection(this.getPointerPosition());
                if (shape && shape.isListening()) {
                    shape._fireAndBubble(TOUCHMOVE, {evt: evt});
                    // only call preventDefault if the shape is listening for events
                    if (shape.isListening() && evt.preventDefault) {
                        evt.preventDefault();
                    }
                }
                this._fire(CONTENT_TOUCHMOVE, {evt: evt});
            }
            if(dd) {
                if (Konva.isDragging()) {
                    evt.preventDefault();
                }
            }
        }
    };

}) ();