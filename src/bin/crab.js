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
  isIframe = false;
  // 页面是否加载完成
  loaded = false;
  timer = null;
  list = [];
  constructor({ isIframe }) {
    this.isIframe = isIframe;
    this.debouncedCapture = Utils.debounce(this.captureElementTag.bind(this), 3000);
  }
  start() {
    Utils.log("Started");
    Utils.log(`isIframe@${this.isIframe}`);
    try {
      this.intercept(this.contentResolver);
      // 自动检测网址
      this.autoCheckWebsite();
      this.listenMsg();
    } catch (e) {
      console.error(e);
      Utils.log("Started Failed");
    }
  }
  // 拦截器
  intercept(handler) {
    Utils.log('Intercept Inject Start');
    const _ = this;
    const _r_text = unsafeWindow.Response.prototype.text;
    unsafeWindow.Response.prototype.text = function () {
      return new Promise((resolve, reject) => {
        _r_text
          .call(this)
          .then((text) => {
            resolve(text);
            handler.bind(_, { url: this.url, content: text })();
          })
          .catch(reject);
      });
    };
    Utils.log('Intercept Response Inject Success');

    const originalXMLHttpRequest = unsafeWindow.XMLHttpRequest;
    const customXMLHttpRequest = function () {
      const req = new originalXMLHttpRequest();

      // 拦截 open 方法
      const originalOpen = req.open;
      req.open = function () {
        originalOpen.apply(this, arguments);
        try {
          this.addEventListener("load", () => {
            if (!["", "json"].includes(this.responseType)) return;
            const reqURL = arguments[1];
            const content = this.responseText;
            // 优先解析的必须是一个正常的网址，然后不解析 ts 地址
            if (Utils.isURL(reqURL)) {
              handler.bind(_, { url: reqURL, content })();
            }
          });
        } catch (e) {
          console.error(e);
        }
        return req;
      };

      return req;
    };

    // 替换页面中的 XMLHttpRequest 对象
    unsafeWindow.XMLHttpRequest = customXMLHttpRequest;
    Utils.log('Intercept XMLHttpRequest Inject Success');
  }
  // 内容处理
  contentResolver({ content, url }) {
    const handlers = this.handlers.filter((h) => h.match({ content, url }));
    Utils.log(`${url}: 匹配到解析器 ` + handlers.length + '个');
    handlers.forEach((h) => h.handle.bind(this, { content, url })());
  }
  // 添加新的媒体到解析到的媒体列表
  addMedia({ url, type, duration, audioUrl }) {
    const isHaveSameUrl =
      this.list.findIndex((item) => item?.url && item?.url === url) !== -1;
    // 判断是否已经存在相同的媒体
    if (!isHaveSameUrl) {
      if (this.list.length === 0) mitter.emit("haveMedia", true);
      this.list.push({ url, type, duration, audioUrl });
      // 如果当前是 iframe 那么不需要给 ui 发送媒体数据的消息而已给 parentwindow 的 ui 发送消息
      // 如果是 iframe 环境，发送消息给父窗口
      if (this.isIframe) {
        Utils.log("Send Media To Parent");
        this.list.length &&
          window.parent.postMessage(
            JSON.stringify({
              type: "ffandown_media",
              data: this.list,
            }),
            "*"
          );
      } else {
        // 非 iframe 环境，正常发送消息
        this.list.length && mitter.emit("sendMedia", this.list);
      }
    }
  }
  async handlerM3u8({ content, url }) {
    Utils.log('Parser M3U8 URL: ' + url);
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
    if (url && Utils.isURL(url)) {
      // todo: 如果 url是嵌入的地址，需要从 url 内提取地址
      const { isVideo, type } = await Utils.headURL(url);
      Utils.log(`当前地址是否为视频地址: ${isVideo}@${url}`);
      if (isVideo) {
        const data = {
          type: type || "未知",
          url: url,
          duration: "未知",
        };
        this.addMedia(data);
      }
      return;
    }
    // 如果没有 content，那么不需要处理
    if (!content) return;
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

  captureElementTag () {
      const _this = this
      const existingIframes = document.getElementsByTagName('iframe');
      const existingVideos = document.getElementsByTagName('video');
      const allTags = Array.from([...existingIframes, ...existingVideos]);
      Utils.log(`captureElementTag捕获到video/iframe 标签: ${Array.from(allTags).length}个`);
      // 获取 video 的地址
      Array.from(allTags).forEach(nodeTag => {
        Utils.nextTick(() => {
          const url = nodeTag.getAttribute('src');
          if (url && Utils.isURL(url)) {
            Utils.log('captureElementTag处理地址: ' + url)
            _this.handlerVideo({ content: '', url: Utils.getNestedUrl(url) });
          }
        });
      });
  }

  // 监听 iframe 的添加
  iframeListen() {
    const _this = this;
    Utils.log('Start Iframe Listen');
    // 创建观察器实例
    const observer = new MutationObserver((mutations, observer) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'VIDEO') {
              // 处理 video 元素
              const videoSrc = node.getAttribute('src');
              videoSrc && Utils.log(`Video Tag 解析到视频地址: ${videoSrc}`);
              if (videoSrc) {
                _this.handlerVideo({
                  content: '',
                  url: videoSrc,
                });
              }
            }
            _this.debouncedCapture();
          } else {
            if (Utils.isURL(node.nodeValue)) {
              Utils.log(`其他节点解析到视频地址: ${node.nodeValue}`);
              _this.handlerVideo({
                content: '',
                url: node.nodeValue,
              });
            }
          }
        });
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  // 监听消息
  listenMsg() {
    Utils.startListener();
    Utils.getValue("ffandownConfig").then((configStringify) => {
      try {
        this.backendConfig = JSON.parse(configStringify);
      } catch {
        console.error('parse ffandownConfig failed', configStringify);
      }
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
    Utils.log('AutoCheckWebsite');
    const originUrl = window.location.origin;
    const pathname = window.location.pathname;
    const _this = this;
    (unsafeWindow || window) && (unsafeWindow || window).requestAnimationFrame(() => {
      Utils.log('requestAnimationFrame');
      const existingIframes = document.getElementsByTagName('iframe');
      const existingVideos = document.getElementsByTagName('video');
      const allTags = Array.from([...existingIframes, ...existingVideos]);
      Utils.log(`捕获到video/iframe 标签: ${Array.from(allTags).length}个`);
      // 获取 video 的地址
      Array.from(allTags).forEach(nodeTag => {
        Utils.nextTick(() => {
          const url = nodeTag.getAttribute('src');
          if (url && Utils.isURL(url)) {
            Utils.log('处理地址: ' + url)
            _this.handlerVideo({ content: '', url: Utils.getNestedUrl(url) });
          }
        });
      });
    });
    // dom 节点渲染完成
    function handleDomReady() {
      Utils.log('DOMContentLoaded');
      if (
        new RegExp("https://www.bilibili.com/video/[a-zA-Z0-9]+/").test(
          originUrl + pathname
        )
      ) {
        // bilibili 播放页面
        const allMedia = Utils.getBilibiliVideo();
        allMedia.forEach((item) => _this.addMedia(item));
      } else {
        _this.iframeListen();
        Utils.log('Normal Website Iframe Listen');
      }
    }
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      handleDomReady();
    } else {
      document.addEventListener('DOMContentLoaded', handleDomReady);
      window.addEventListener('load', handleDomReady);
    }
  }
}
export default Crab;
