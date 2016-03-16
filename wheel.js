! function() {
    //lazy load function && event compat code
    var addEvent = (function(window) {
        var _eventCompat = function(event) {
            var type = event.type;
            if (type === 'DOMMouseScroll' || type === 'mousewheel') {
                event.delta = event.wheelDelta ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }

            if (event.srcElement && !event.target) {
                event.target = event.srcElement;
            }

            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {
                    event.returnValue = false;
                };
            }

            return event;
        };

        if (window.addEventListener) {
            return function(elem, type, fn, capture) {
                if (type === 'mousewheel' && document.mozHidden !== undefined) {
                    type = 'DOMMouseScroll';
                }

                elem.addEventListener(type, function(event) {
                    fn.call(elem, _eventCompat(event));
                }, capture || false);
            };
        } else if (window.attachEvent) {
            return function(elem, type, fn, capture) {
                elem.attachEvent('on' + type, function(event) {
                    event = event || window.event;
                    fn.call(elem, _eventCompat(event));
                });
            };
        }

        return function() {};

    })(window);

    function ScreenWheel() {
        if (!(this instanceof ScreenWheel)) return new ScreenWheel();
        this.wheel = document.getElementsByClassName('wheel')[0];
        if (this.wheel) {
            this.indicators = this.wheel.getElementsByClassName('wheel-indicator')[0].children;
            this.pages = this.wheel.getElementsByClassName('page');
        }
    }

    ScreenWheel.prototype = {
        constructor: ScreenWheel,

        prePageIdx: 0,

        cdFlag: true,

        changePage: function(idx) {
            //显示当前页面
            this.indicators[idx].className = 'active';
            this.pages[idx].style.height = document.body.offsetHeight + 'px';

            //隐藏之前页面
            this.indicators[this.prePageIdx].className = '';
            this.pages[this.prePageIdx].style.height = 0;

            this.prePageIdx = idx;
        },

        initPageHeight: function() {
            //初始化页面高度
            var pages = this.pages;
            if (pages) {
                var bodyHeight = document.body.offsetHeight;

                pages[0].style.height = bodyHeight + 'px';
                for (var i = pages.length - 1; i >= 1; --i) {
                    pages[i].style.height = 0;
                }
            }
        },

        indicatorsBind: function() {
            var indicators = this.indicators;
            var self = this;
            for (var len = indicators.length - 1; len >= 0; --len) {
                (function(idx) {
                    addEvent(indicators[idx], 'click', function(e) {
                        self.changePage(idx);
                    });
                })(len);
            }
        },

        mouseWheelBind: function() {
            var self = this;

            addEvent(document.body, 'mousewheel', function(e) {
                if (self.cdFlag) {
                    self.cdFlag = false;
                    if (e.delta > 0) {
                        if (self.prePageIdx !== 0) {
                            self.changePage(self.prePageIdx - 1);
                        }
                    } else {
                        if (self.prePageIdx !== self.pages.length - 1) {
                            self.changePage(self.prePageIdx + 1);
                        }
                    }
                    setTimeout(function() {
                        self.cdFlag = true;
                    }, 800);
                }
            });

        },

        init: function() {
            this.initPageHeight();
            this.indicatorsBind();
            this.mouseWheelBind();
        }

    };

    (new ScreenWheel()).init();

}();
