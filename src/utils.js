import Home from './page/index.vue'
import { createApp } from 'vue'
const globalCSS = require('./assets/global.css')
const Utils = {
    log(content) {
        const fun = console.log;
        const args = [
            `%c Crab %c ${content}`,
            'padding: 2px 1px; border-radius: 0; color: #fff; background: #606060; font-weight: bold;',
            'padding: 2px 5px 2px 2px; border-radius: 0; color: #fff; background: #AF8FE8; font-weight: bold;',
        ]
        fun.apply(void 0, args);
    },
    addStyle(s) {
        let style = document.createElement("style");
        style.innerHTML = s;
        document.documentElement.appendChild(style);
    },
    async getValue(name, defaultVal) {
        return await ((typeof GM_getValue === "function") ? GM_getValue : GM.getValue)(name, defaultVal);
    },
    async setValue(name, value) {
        return await ((typeof GM_setValue === "function") ? GM_setValue : GM.setValue)(name, value);
    },
    async deleteValue(name) {
        return await ((typeof GM_deleteValue === "function") ? GM_deleteValue : GM.deleteValue)(name);
    },
    openInTab(url, open_in_background = false) {
        return ((typeof GM_openInTab === "function") ? GM_openInTab : GM.openInTab)(url, open_in_background);
    },
    message(text, type) {
        if (!this.notyf) {
            this.notyf = new Notyf({ duration: 1000, position: { x: 'left', y: 'top' } })
        }
        if (type === 'success') {
            this.notyf.success(text)
        } else {
            this.notyf.error(text)
        }
    },
    xmlHttpRequest(details) {
        return ((typeof GM_xmlhttpRequest === "function") ? GM_xmlhttpRequest : GM.xmlHttpRequest)(details);
    },
    setDownloadToFFandown(FFANDOWN_URL, url, name) {
        const _this = this;
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                name,
                url
            })
            this.xmlHttpRequest({
                url: FFANDOWN_URL + "/down",
                method: 'POST',
                headers: {
                    "content-type": "application/json"
                },
                timeout: 3000,
                contentType: "application/json",
                dataType: "json",
                responseType: 'json',
                data,
                onload(r) {
                    const response = r.response
                    if (response && response.code === 0) {
                        Utils.message("Send success")
                    } else {
                        Utils.message("Send failed")
                    }
                    resolve()
                },
                onerror(e) {
                    Utils.message("Send failed: " + e.statusText)
                    reject(e);
                }
            })
        })
    },
    copyText(text) {
        // 复制文本
        var copyFrom = document.createElement("textarea");
        copyFrom.textContent = text;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        copyFrom.blur();
        document.body.removeChild(copyFrom);
    },
    startListener() {
        window.addEventListener("message", async (e) => {
            if (e.data === "3j4t9uj349-gm-get-title") {
                let name = `top-title-${Date.now()}`;
                await Utils.setValue(name, document.title);
                e.source.postMessage(`3j4t9uj349-gm-top-title-name:${name}`, "*");
            }
        });
        document.addEventListener('DOMContentLoaded',function(){
            const styleEL = document.createElement("style")
            styleEL.innerText = "@import url('https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css'); .notyf {font-size: 12px !important;}"
            document.body.append(styleEL)
        });
    },
    getTopTitle() {
        return new Promise(resolve => {
            window.addEventListener("message", async function l(e) {
                if (typeof e.data === "string") {
                    if (e.data.startsWith("3j4t9uj349-gm-top-title-name:")) {
                        let name = e.data.slice("3j4t9uj349-gm-top-title-name:".length);
                        await new Promise(r => setTimeout(r, 5)); // 等5毫秒 确定 setValue 已经写入
                        resolve(await Utils.getValue(name));
                        Utils.deleteValue(name);
                        window.removeEventListener("message", l);
                    }
                }
            });
            window.top.postMessage("3j4t9uj349-gm-get-title", "*");
        });
    },
    checkM3u8Content({ content }) {
        // 如果内容为m3u8的则返回true
        if (content.trim().startsWith("#EXTM3U")) {
            return true;
        } else {
            return false;
        }
    },
    checkFileContent({ content, url }) {
        const getUrlSuffix = (url) => url.replace(new URL(url).search, '')
        const fileSuffix = ['.mp4', '.avi', '.mov']
        if (fileSuffix.some(suffix => url.endsWith(suffix))) {
            return true;
        } else {
            return false
        }
    },
    createShadowDom() {
        const rootDiv = document.createElement("div");
        // rootDiv.style = `position: fixed;z-index: 9999;width: 100%;height:100%; pointer-events: none;`;
        document.documentElement.appendChild(rootDiv);
        const shadowDOM = rootDiv.attachShadow({ mode: 'open' });
        createApp(Home).mount(shadowDOM);
        rootDiv.shadowRoot.appendChild(document.createElement('style'))
        shadowDOM.querySelector('style').innerHTML = globalCSS;
    }
}

export default Utils;