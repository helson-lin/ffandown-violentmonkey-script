import Home from '../page/index.vue'
import globalCSS from '../main.css'
import Crab from './crab'
import { createApp } from 'vue'
class TmpScipt {
    crab;
    constructor() {
        this.init()
        this.initCrab()
    }

    init() {
        this.createShadowDom()
    }

    initCrab () {
        this.crab = new Crab();
        this.crab.start();
    }

    createShadowDom() {
        const rootDiv = document.createElement("div");
        document.documentElement.appendChild(rootDiv);
        const shadowDOM = rootDiv.attachShadow({ mode: 'open' });
        createApp(Home).mount(shadowDOM);
        rootDiv.shadowRoot.appendChild(document.createElement('style'))
        shadowDOM.querySelector('style').innerHTML = globalCSS;
    }
}

export default TmpScipt