
import Utils from "./utils";
import mitter from './mitter.js'
class Crab {
    handlers = [
        {
            match: Utils.checkM3u8Content,
            handle: this.handlerM3u8
        },
        {
            match: Utils.checkFileContent,
            handle: this.handlerVideo
        }
    ];
    // 服务复制
    ffandownURL;
    // 资源列表
    list = [];
    start() {
        Utils.log('Started')
        Utils.createShadowDom()
        this.intercept(this.contentResolver);
        this.listenMsg()
    }
    // 拦截器
    intercept(handler) {
        const _ = this;
        const isFunc = handler && typeof handler === 'function'
        const _r_text = unsafeWindow.Response.prototype.text;
        unsafeWindow.Response.prototype.text = function () {
            return new Promise((resolve, reject) => {
                _r_text.call(this).then((text) => {
                    resolve(text);
                    if (isFunc) handler.bind(_, { url: this.url, content: text })()
                }).catch(reject);
            });
        }

        const _open = unsafeWindow.XMLHttpRequest.prototype.open;
        unsafeWindow.XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                try {
                    let content = this.responseText;
                    if (isFunc) handler.bind(_, { url: args[1], content })()
                } catch (e) {
                    console.warn(e)
                }
            });
            return _open.apply(this, args);
        }
    }
    // 内容处理
    contentResolver({ content, url }) {
        const handlers = this.handlers.filter(h => h.match({ content, url }));
        handlers.forEach(h => h.handle.bind(this, { content, url })());
    }
    addMedia({ url, type, duration }) {
        const isHaveSameUrl = this.list.findIndex(item => item?.url && item?.url === url) !== -1
        if (!isHaveSameUrl) {
            if (this.list.length === 0) mitter.emit('haveMedia', true)
            this.list.push({ url, type, duration })
            mitter.emit('sendMedia', this.list)
        }
    }
    async handlerM3u8({ content, url }) {
        if (!url || !url.startsWith("http")) return;
        url = new URL(url);
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
        const data = {
            type: "m3u8",
            url: url.href,
            duration: manifest.duration ? `${Math.ceil(manifest.duration * 10 / 60) / 10} mins` : manifest.playlists ? `多(Multi)(${manifest.playlists.length})` : "未知(unknown)",
        }
        this.addMedia(data)
    }
    async handlerVideo({ content, url }) {
        Utils.log('handlerVideo', url)
    }
    // 监听消息
    listenMsg() {
        Utils.startListener()
        Utils.getValue('ffandownURL').then((url) => {this.ffandownURL = url;})
        mitter.on('getServerUrl', () => this.ffandownURL)
        mitter.on('sendDownload', (data) => {
            Utils.getTopTitle().then((title) => {
                if (!this.ffandownURL) {
                    Utils.message('Please Set ServerUrl First')
                } else {
                    Utils.setDownloadToFFandown(this.ffandownURL, data.url, title)
                }
            }).catch(e => console.error(e))
        })
        mitter.on('getMedia', () => this.list)
        mitter.on('serverUrl', (url) => {
            Utils.setValue('ffandownURL', url)
            this.ffandownURL = url
        })
    }
}
export default Crab;