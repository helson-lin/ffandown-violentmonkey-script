class Mitter {
    constructor() {
        this.listener = {};
    }

    isPromise(fn) {
        return fn?.then && typeof fn?.then === 'function' 
    }

    isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    
    emitParamIsFunc(args) {
        if (args && this.isArray(args) && args.length === 1 && typeof args[0] === 'function') return true
        return false
    }

    on(key, func) {
        if (key && func && typeof func === 'function') {
            if (this.listener[key] && this.isArray(this.listener[key])) {
                this.listener[key].push(func);
            } else {
                this.listener[key] = [func]; // Now correctly adds the function to the array
            }
        }
    }

    emit(key, ...args) {
        const allListeners = this.listener[key];
        if (!allListeners || !this.isArray(allListeners)) return; // Use isArray correctly
        allListeners.forEach(listener => {
            if (!listener || typeof listener !== 'function') return;
            const argIsFunc = this.emitParamIsFunc(args)
            // 如果args内存在function，那么作为callback来识别
            if (this.isPromise(listener)) {
                if (argIsFunc) {
                    listener().then((data) => args[0] && typeof args[0] === 'function' && args[0](data))
                } else {
                    listener(...args)
                }
            } else {
                if (argIsFunc) {
                    const data = listener()
                    args[0] && typeof args[0] === 'function' && args[0](data)
                } else {
                    listener(...args);
                }
            }
        });
    }
}

const mitter = (() => {
    let instance;
    return () => {
        if (!instance) instance = new Mitter();
        return instance;
    };
})()();


export default mitter;
