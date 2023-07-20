// ==UserScript==
// @name        ffandown
// @namespace   Violentmonkey Scripts
// @match        *://*/*
// @exclude      *://github.com/*
// @version      1.3
// @description  ffandown m3u8下载器视频嗅探插件
// @icon          https://pic.kblue.site/picgo/ffandown_favicon.ico
// @author       helsonlin
// @license MIT
// @namespace    https://github.com/helson-lin
// @homepage     https://github.com/helson-lin
// @match        *://*/*
// @exclude      *://github.com/*
// @require      https://cdn.jsdelivr.net/npm/m3u8-parser@4.7.1/dist/m3u8-parser.min.js
// @require      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @connect      *
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM.openInTab
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_deleteValue
// @grant        GM.deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_download
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';
    const FFANDOWN_URL = 'http://192.168.31.22:8081'
    const mgmapi = {
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
        xmlHttpRequest(details) {
            return ((typeof GM_xmlhttpRequest === "function") ? GM_xmlhttpRequest : GM.xmlHttpRequest)(details);
        },
        setDownloadToFFandown(url, name) {
            const _this = this;
            return new Promise((resolve, reject) => {
                const data = JSON.stringify({
                  name,
                  url
                })
                mgmapi.xmlHttpRequest({
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
                            console.log("success", _this)
                          _this.message(response.message, "success")
                        } else {
                            console.log("fialed", _this)
                          _this.message(response.message || "send error")
                        }
                        resolve()
                    },
                    onerror(e) {
                        reject(e);
                    }
                })
            })
        },
        copyText(text) {
            copyTextToClipboard(text);
            function copyTextToClipboard(text) {
                // 复制文本
                var copyFrom = document.createElement("textarea");
                copyFrom.textContent = text;
                document.body.appendChild(copyFrom);
                copyFrom.select();
                document.execCommand('copy');
                copyFrom.blur();
                document.body.removeChild(copyFrom);
            }
        },
        message(text, type) {
            if (!this.notyf) {
                this.notyf = new Notyf({duration: 1000,position: {x: 'left',y: 'top'}})
            }
            if(type === 'success') {
                this.notyf.success(text)
            } else {
                this.notyf.error(text)
            }
        }
    };
    document.addEventListener('DOMContentLoaded',function(){
        const styleEL = document.createElement("style")
        styleEL.innerText = "@import url('https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css'); .notyf {font-size: 12px !important;}"
        document.body.append(styleEL)
    });
    // iframe 信息交流
    // 目前只用于获取顶部标题
    window.addEventListener("message", async (e) => {
        if (e.data === "3j4t9uj349-gm-get-title") {
            let name = `top-title-${Date.now()}`;
            await mgmapi.setValue(name, document.title);
            e.source.postMessage(`3j4t9uj349-gm-top-title-name:${name}`, "*");
        }
    });
    // window.notyf("shownUrls")
    function getTopTitle() {
        return new Promise(resolve => {
            window.addEventListener("message", async function l(e) {
                if (typeof e.data === "string") {
                    if (e.data.startsWith("3j4t9uj349-gm-top-title-name:")) {
                        let name = e.data.slice("3j4t9uj349-gm-top-title-name:".length);
                        await new Promise(r => setTimeout(r, 5)); // 等5毫秒 确定 setValue 已经写入
                        resolve(await mgmapi.getValue(name));
                        mgmapi.deleteValue(name);
                        window.removeEventListener("message", l);
                    }
                }
            });
            window.top.postMessage("3j4t9uj349-gm-get-title", "*");
        });
    }

    {

        const _r_text = unsafeWindow.Response.prototype.text;
        unsafeWindow.Response.prototype.text = function () {
            return new Promise((resolve, reject) => {
                _r_text.call(this).then((text) => {
                    resolve(text);
                    if (checkContent(text)) doM3U({ url: this.url, content: text });
                }).catch(reject);
            });
        }

        const _open = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                try {
                    let content = this.responseText;
                    if (checkContent(content)) doM3U({ url: args[1], content });
                } catch { }
            });
            return _open.apply(this, args);
        }

        function checkContent(content) {
            if (content.trim().startsWith("#EXTM3U")) {
                return true;
            }
        }


    }

    const rootDiv = document.createElement("div");
    rootDiv.style = `
        position: fixed;
        z-index: 9999999999999999;
        opacity: 0.9;
    `;
    rootDiv.style.display = "none";
    document.documentElement.appendChild(rootDiv);

    const shadowDOM = rootDiv.attachShadow({ mode: 'open' });
    const wrapper = document.createElement("div");
    shadowDOM.appendChild(wrapper);


    // 指示器
    const bar = document.createElement("div");
    bar.style = `
        text-align: right;
    `;
    bar.innerHTML = `
        <span
            class="number-indicator"
            data-number="0"
            style="
                display: inline-flex;
                width: 1.5rem;
                height: 1.5rem;
                background: rgba(255,255,255,0.3);
                backdrop-filter: blur(10px);
                padding: 0.1rem;
                border-radius: 50%;
                margin-bottom: 5px;
                cursor: pointer;
                border: 2px solid rgba(100, 108, 255, 0.7);
                justify-content: center;
                align-items: center;
            "
        >
        <svg t="1682781761045" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="44387" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="25"><path d="M537 137c165.23 0 302.183 121.067 326.991 279.332C922.626 464.753 960 538.012 960 620c0 145.803-118.197 264-264 264H348c-156.942-0.542-284-127.933-284-285 0-115.73 68.98-215.348 168.067-259.984C282.35 220.296 399.947 137 537 137z m-25 255c-17.673 0-32 14.327-32 32v175.758l-45.373-45.383-0.377-0.372c-12.524-12.127-32.506-12.003-44.877 0.372-12.497 12.5-12.497 32.765 0 45.265l84.52 84.54 0.635 0.624c21.06 20.395 54.635 20.27 75.543-0.434l85.444-84.618 0.373-0.375c12.186-12.467 12.162-32.453-0.148-44.89-12.435-12.561-32.696-12.662-45.255-0.225L544 600.296V424c0-17.673-14.327-32-32-32z" fill="#6495ED" p-id="44388"></path></svg>
        </span>
    `;

    wrapper.appendChild(bar);

    // 样式
    const style = document.createElement("style");

    style.innerHTML = `
        .notyf {font-size:12px !important;}
        .number-indicator{
            position:relative;
        }

        .number-indicator::after{
            content: attr(data-number);
            position: absolute;
            bottom: -5px;
            right: -5px;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            border-radius: 10px;
            padding: 3px 5px;
        }

        .copy-link:active{
            color: #ccc;
        }

        .download-btn:hover{
            text-decoration: underline;
        }
        .download-btn:active{
            opacity: 0.9;
        }

        .m3u8-item{
            color: white;
            margin-bottom: 5px;
            display: flex;
            flex-direction: row;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 14px;
            user-select: none;
        }

        [data-shown="false"] {
            opacity: 0.8;
            zoom: 1;
        }

        [data-shown="false"]:hover{
            opacity: 1;
        }

        [data-shown="false"] .m3u8-item{
            display: none;
        }

    `;

    wrapper.appendChild(style);
    const barBtn = bar.querySelector(".number-indicator");
    // 关于显隐和移动

    (async function () {

        let shown = await GM_getValue("shown", true);
        wrapper.setAttribute("data-shown", shown);


        let x = await GM_getValue("x", 10);
        let y = await GM_getValue("y", 10);

        x = Math.min(innerWidth - 50, x);
        y = Math.min(innerHeight - 50, y);

        if (x < 0) x = 0;
        if (y < 0) y = 0;

        rootDiv.style.top = `${y}px`;
        rootDiv.style.right = `${x}px`;

        barBtn.addEventListener("mousedown", e => {
            let startX = e.pageX;
            let startY = e.pageY;

            let moved = false;

            let mousemove = e => {
                let offsetX = e.pageX - startX;
                let offsetY = e.pageY - startY;
                if (moved || (Math.abs(offsetX) + Math.abs(offsetY)) > 5) {
                    moved = true;
                    rootDiv.style.top = `${y + offsetY}px`;
                    rootDiv.style.right = `${x - offsetX}px`;
                }
            };
            let mouseup = e => {

                let offsetX = e.pageX - startX;
                let offsetY = e.pageY - startY;

                if (moved) {
                    x -= offsetX;
                    y += offsetY;
                    mgmapi.setValue("x", x);
                    mgmapi.setValue("y", y);
                } else {
                    shown = !shown;
                    mgmapi.setValue("shown", shown);
                    wrapper.setAttribute("data-shown", shown);
                }

                removeEventListener("mousemove", mousemove);
                removeEventListener("mouseup", mouseup);
            }
            addEventListener("mousemove", mousemove);
            addEventListener("mouseup", mouseup);
        });
    })();






    let count = 0;
    let shownUrls = [];

    async function doM3U({ url, content }) {
        if(!url || !url.startsWith("http")) return;
        url = new URL(url);

        if (shownUrls.includes(url.href)) return;

        // 解析 m3u
        content = content || await (await fetch(url)).text();

        const parser = new m3u8Parser.Parser();
        parser.push(content);
        parser.end();
        const manifest = parser.manifest;

        if (manifest.segments) {
            let duration = 0;
            manifest.segments.forEach((segment) => {
                duration += segment.duration;
            });
            manifest.duration = duration;
        }
        console.log(manifest)
        showVideo({
            type: "m3u8",
            url,
            duration: manifest.duration ? `${Math.ceil(manifest.duration * 10 / 60) / 10} mins` : manifest.playlists ? `多(Multi)(${manifest.playlists.length})` : "未知(unknown)",
            async download() {
                const file_name = await getTopTitle() || Date.now().toString();
                mgmapi.setDownloadToFFandown(url.href, file_name).then(() => mgmapi.message("任务发送成功", "success")).catch(() => mgmapi.message("无法与主机通信,请检查服务器地址", "error"))
            }
        })

    }

    async function showVideo({
        type,
        url,
        duration,
        download
    }) {
        let div = document.createElement("div");
        div.className = "m3u8-item";
        div.innerHTML = `
            <span>${type}</span>
            <span
                class="copy-link"
                title="${url}"
                style="
                    max-width: 200px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    margin-left: 10px;
                "
            >${url.pathname}</span>
            <span
                style="
                    margin-left: 10px;
                    flex-grow: 1;
                "
            >${duration}</span>
            <span
                class="download-btn"
                style="
                    margin-left: 10px;
                    cursor: pointer;
            ">Download</span>
        `;
        div.querySelector(".copy-link").addEventListener("click", () => {
            // 复制链接
            mgmapi.copyText(url.href);
            mgmapi.message("已复制链接 (link copied)", "success");
        });

        div.querySelector(".download-btn").addEventListener("click", download);

        rootDiv.style.display = "block";

        count++;

        shownUrls.push(url.href);

        bar.querySelector(".number-indicator").setAttribute("data-number", count);

        wrapper.appendChild(div);
    }

})();