(function() {
    /***************************** custom event polyfill ******************************/
    if(!window.CustomEvent) {
        let CustomEvent = function( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'Events' );
            evt.initEvent(event, params.bubbles, params.cancelable);
            evt.detail = params.detail;
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    /***************************** event behavior ******************************/
    let EVENT_SPLITTER = ' ';
    let EventBehavior = {
        /*
        * 绑定事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Function} listener 监听函数
        * @param {Boolean} optional useCapture 是否在捕捉阶段执行回调
        * */
        on: function(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                let cb = addListener.call(this, type, listener);
                this.addEventListener(type, cb, useCapture);
            }
        },

        /*
        * 注销事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Function} listener 监听函数
        * @param {Boolean} optional useCapture 是否在捕捉阶段执行回调
        * */
        off: function(types, listener, useCapture) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                let cb = removeListener.call(this, type, listener);
                cb && this.removeEventListener(type, cb, useCapture);
            }
        },

        /*
        * 触发事件
        * @param {String} types 事件名，绑定多个事件可以空格间隔
        * @param {Array} details 额外参数
        * */
        trigger: function(types, details) {
            types = types.split(EVENT_SPLITTER);
            let type;
            while(type = types.shift()) {
                let event = new CustomEvent(type, {detail: details});
                this.dispatchEvent(event);
            }
        }
    };

    function addListener(type, listener) {
        !this._eventListeners && (this._eventListeners = {});
        !this._eventListeners[type] && (this._eventListeners[type] = new Map());

        let self = this;
        let listenersMap = this._eventListeners[type];
        let listenerWrap = listenersMap.get(listener);

        if(!listenerWrap) {
            listenerWrap = function(e) {
                let args = [e].concat(e.detail);
                listener.apply(self, args);
            }
            listenersMap.set(listener, listenerWrap);
        }

        return listenerWrap;
    }


    function removeListener(type, listener) {
        if(!this._eventListeners || !this._eventListeners[type]) {return;}
        let listenersMap = this._eventListeners[type];
        let listenerWrap = listenersMap.get(listener);
        listenersMap.delete(listener);
        return listenerWrap;
    }

    Nova.EventBehavior = EventBehavior;
})();
