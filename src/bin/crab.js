import Utils from "./utils.js";
import mitter from "./mitter.js";
class Crab {
  handlers = [
    {
      match: Utils.checkM3u8Content,
      handle: this.handlerM3u8,
    },
    {
      match: Utils.checkFileContent,
      handle: this.handlerVideo,
    },
    {
      match: Utils.checkBilibiContent,
      handle: this.handlerBilibili,
    },
  ];
  // 服务复制
  backendConfig;
  // 资源列表
  list = [];
  start() {
    Utils.log("Started");
    this.intercept(this.contentResolver);
    // 自动检测网址
    this.autoCheckWebsite();
    this.listenMsg();
  }
  // 拦截器
  intercept(handler) {
    const _ = this;
    const isFunc = handler && typeof handler === "function";
    const _r_text = unsafeWindow.Response.prototype.text;
    unsafeWindow.Response.prototype.text = function () {
      return new Promise((resolve, reject) => {
        _r_text
          .call(this)
          .then((text) => {
            resolve(text);
            if (isFunc) handler.bind(_, { url: this.url, content: text })();
          })
          .catch(reject);
      });
    };

    const _open = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function (...args) {
      this.addEventListener("load", () => {
        try {
          if (!["", "json"].includes(this.responseType)) return;
          let content = this.responseText;
          if (isFunc) handler.bind(_, { url: args[1], content })();
        } catch (e) {
          // console.warn(e);
        }
      });
      return _open.apply(this, args);
    };
  }
  // 内容处理
  contentResolver({ content, url }) {
    const handlers = this.handlers.filter((h) => h.match({ content, url }));
    handlers.forEach((h) => h.handle.bind(this, { content, url })());
  }
  addMedia({ url, type, duration, audioUrl }) {
    const isHaveSameUrl =
      this.list.findIndex((item) => item?.url && item?.url === url) !== -1;
    if (!isHaveSameUrl) {
      if (this.list.length === 0) mitter.emit("haveMedia", true);
      this.list.push({ url, type, duration, audioUrl });
      mitter.emit("sendMedia", this.list);
    }
  }
  async handlerM3u8({ content, url }) {
    if (!url || !url.startsWith("http")) return;
    url = new URL(url);
    // 解析 m3u
    content = content || (await (await fetch(url)).text());
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
      duration: manifest.duration
        ? `${Math.ceil((manifest.duration * 10) / 60) / 10} mins`
        : manifest.playlists
          ? `多(Multi)(${manifest.playlists.length})`
          : "未知(unknown)",
    };
    this.addMedia(data);
  }
  async handlerBilibili({ content, url }) {
    console.log("bilibili", content, url);
  }
  async handlerVideo({ content, url }) {
    const matches = content.match(/(https|http):\/\/[\w./-]+.(mp4|avi|mov)/g);
    if (matches && Array.isArray(matches)) {
      matches.forEach((url) => {
        const data = {
          type: "MP4",
          url: url,
          duration: "未知",
        };
        this.addMedia(data);
      });
    }
  }
  // 监听消息
  listenMsg() {
    Utils.startListener();
    Utils.getValue("ffandownConfig").then((configStringify) => {
      this.backendConfig = JSON.parse(configStringify);
    });
    mitter.on("getServerConfig", () => this.backendConfig);
    mitter.on("sendDownload", ({ data, index }) => {
      Utils.getTopTitle()
        .then((title) => {
          // check sever config
          if (!this.backendConfig?.url || !this.backendConfig?.params) {
            Utils.message("Please Set Server Url And Params First");
          } else {
            Utils.sendDownloadRequest({
              serverConfig: this.backendConfig,
              url: data.url,
              name: title + "-" + (index + 1),
              audioUrl: data?.audioUrl,
            });
          }
        })
        .catch((e) => console.error(e));
    });
    mitter.on("getMedia", () => this.list);
    mitter.on("setServerConfig", (config) => {
      Utils.setValue("ffandownConfig", JSON.stringify(config));
      // update ffandown config
      this.backendConfig = config;
    });
  }

  autoCheckWebsite() {
    const originUrl = window.location.origin;
    const pathname = window.location.pathname;
    const _this = this;
    if (
      new RegExp("https://www.bilibili.com/video/[a-zA-Z0-9]+/").test(
        originUrl + pathname,
      )
    ) {
      // bilibili播放页面， 读取 window.__playinfo_获取播放信息
      // bilibli的下载任务需要指定refer为bilibili.com 否则无法下载
      document.addEventListener("DOMContentLoaded", function () {
        const allMedia = Utils.getBilibiliVideo();
        allMedia.forEach((item) => _this.addMedia(item));
      });
    }
  }
}
export default Crab;
