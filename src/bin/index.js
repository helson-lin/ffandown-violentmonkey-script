import Home from '../page/index.vue'
import globalCSS from '../main.css'
import Crab from './crab'
import { createApp } from 'vue'

class TmpScipt {
    crab;
    isIframe = false;
    constructor() {
        this.isIframe = this.getWindowIsIframe()
        if (!this.isIframe) {           
            this.init()
        }
        this.initCrab()
    }

    init() {
        this.createShadowDom()
    }

    initCrab () {
        this.crab = new Crab({ isIframe: this.isIframe });
        this.crab.start();
    }

    getWindowIsIframe () {
        return window.self !== window.top;
    }

    createShadowDom() {
        const rootDiv = document.createElement("div");
        document.documentElement.appendChild(rootDiv);
        const shadowDOM = rootDiv.attachShadow({ mode: 'open' });
        createApp(Home).mount(shadowDOM);
        rootDiv.style.fontSize = '12px';
        rootDiv.shadowRoot.appendChild(document.createElement('style'))
        shadowDOM.querySelector('style').innerHTML = globalCSS;
    }
}
export default TmpScipt