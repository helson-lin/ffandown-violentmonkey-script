const Utils = {
  log(content) {
    const fun = console.log;
    const args = [
      `%c Crab %c ${content}`,
      "padding: 2px 1px; border-radius: 0; color: #fff; background: #606060; font-weight: bold;",
      "padding: 2px 5px 2px 2px; border-radius: 0; color: #fff; background: #AF8FE8; font-weight: bold;",
    ];
    fun.apply(void 0, args);
  },
  addStyle(s) {
    let style = document.createElement("style");
    style.innerHTML = s;
    document.documentElement.appendChild(style);
  },
  async getValue(name, defaultVal) {
    return await (
      typeof GM_getValue === "function" ? GM_getValue : GM.getValue
    )(name, defaultVal);
  },
  async setValue(name, value) {
    return await (
      typeof GM_setValue === "function" ? GM_setValue : GM.setValue
    )(name, value);
  },
  async deleteValue(name) {
    return await (
      typeof GM_deleteValue === "function" ? GM_deleteValue : GM.deleteValue
    )(name);
  },
  openInTab(url, open_in_background = false) {
    return (typeof GM_openInTab === "function" ? GM_openInTab : GM.openInTab)(
      url,
      open_in_background,
    );
  },
  message(text, type) {
    if (!this.notyf) {
      this.notyf = new Notyf({
        duration: 1000,
        position: { x: "left", y: "top" },
      });
    }
    if (type === "success") {
      this.notyf.success(text);
    } else {
      this.notyf.error(text);
    }
  },
  xmlHttpRequest(details) {
    return (
      typeof GM_xmlhttpRequest === "function"
        ? GM_xmlhttpRequest
        : GM.xmlHttpRequest
    )(details);
  },
  params2QueryString(data) {
    const params = new URLSearchParams();
    for (const key in data) {
      if (typeof data[key] === 'object') {
        params.append(key, JSON.stringify(data[key]));
      } else {
        params.append(key, data[key]);
      }
    }
    return params.toString();
  },
  sendDownloadToFFandown(FFANDOWN_URL, url, name) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        name,
        url,
      });
      this.xmlHttpRequest({
        url: FFANDOWN_URL + "/down",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        timeout: 3000,
        contentType: "application/json",
        dataType: "json",
        responseType: "json",
        data,
        onload(r) {
          const response = r.response;
          if (response && response.code === 0) {
            Utils.message("Send success");
          } else {
            Utils.message("Send failed");
          }
          resolve();
        },
        onerror(e) {
          Utils.message("Send failed: " + e.statusText);
          reject(e);
        },
      });
    });
  },
  sendDownloadRequest({ serverConfig, url, audioUrl, name }) {
    const _this = this;
    return new Promise((resolve, reject) => {
      const paramsConfigString = serverConfig?.params?.replaceAll('$name', name)?.replaceAll('$url', url).replaceAll('$audioUrl', audioUrl);
      let requestParams;
      try {
        requestParams = JSON.parse(paramsConfigString);
      } catch (error) {
        Utils.message("params config error");
        resolve();
        return;
      }
      this.xmlHttpRequest({
        url: serverConfig?.method === 'POST' ? serverConfig?.url : `${serverConfig?.url}?${_this.params2QueryString(requestParams)}`,
        method: serverConfig?.method,
        headers: {
          "content-type": "application/json",
        },
        timeout: 3000,
        contentType: "application/json",
        dataType: "json",
        responseType: "json",
        data: JSON.stringify(requestParams),
        onload(r) {
          const status = r.status;
          if (status && status === 200) {
            Utils.message("发送成功", "success");
          } else {
            Utils.message("发送失败");
          }
          resolve();
        },
        onerror(e) {
          Utils.message("发送失败: " + e.statusText);
          reject(e);
        },
      });
    });
  },
  copyText(text) {
    // 复制文本
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand("copy");
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
    document.addEventListener("DOMContentLoaded", function () {
      const styleEL = document.createElement("style");
      styleEL.innerText =
        "@import url('https://file.helson-lin.cn/notyf/notyf.min.css'); .notyf {font-size: 12px !important;}";
      document.body.append(styleEL);
    });
  },
  getTopTitle() {
    return new Promise((resolve) => {
      window.addEventListener("message", async function l(e) {
        if (typeof e.data === "string") {
          if (e.data.startsWith("3j4t9uj349-gm-top-title-name:")) {
            let name = e.data.slice("3j4t9uj349-gm-top-title-name:".length);
            await new Promise((r) => setTimeout(r, 5)); // 等5毫秒 确定 setValue 已经写入
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
      // const matches = content.match(
      //   /(https|http):\/\/[\w./-]+.(m3u8)?[^\s"]+/g,
      // );
      // return (matches && matches.length) ?? false;
      return false;
    }
  },
  checkFileContent({ url, content }) {
    const fileSuffix = [".mp4", ".avi", ".mov"];
    if (fileSuffix.some((suffix) => url.endsWith(suffix))) {
      return true;
    } else {
      const matches = content.match(
        /(https|http):\/\/[\w./-]+.(mp4|avi|mov)?[^\s"]+/g,
      );
      return (matches && matches.length) ?? false;
    }
  },
  checkBilibiContent({ url }) {
    const urlInfo = new URL(url.startsWith("//") ? `https:${url}` : url);
    const urlWithoutParams = urlInfo.origin + urlInfo.pathname;

    if (urlWithoutParams.includes("/x/player/wbi/playurl")) return true;
    return false;
  },
  parseBiliData(data) {
    const qualityThresholds = [
      { name: "超清 4K", range: [3840, Infinity] },
      { name: "高清 1080P+", range: [1280, 3840] },
      { name: "高清 1080P", range: [960, 1280] },
      { name: "高清 720P", range: [640, 960] },
      { name: "清晰 480P", range: [480, 640] },
      { name: "流畅 360P", range: [0, 480] },
    ];
    const getCodec = (codec) => {
      if (codec.startsWith("av01")) return "AV1";
      if (codec.startsWith("hev1")) return "H.265";
      if (codec.startsWith("avc1")) return "H.264";
      return codec;
    };
    // TODO: add audio support
    const audioUrls = data?.data?.dash?.audio
      .filter(i => ['mp4a.40.2'].includes(i?.codecs))
      .sort((a, b) => b.bandwidth - a.bandwidth); // 按照bandwidth从大到小排序
    // 对audiUrls内的按照bandwidth从大到小排序
    return data?.data?.dash?.video?.map((i) => {
      const info = {};
      const ratio =
        qualityThresholds.find(
          (e) => e.range[0] < i.width && i.width <= e.range[1],
        )?.name ?? i.width;
      const codecn = getCodec(i.codecs) ?? i.codecs;
      info.duration = ratio + "/" + codecn;
      info.type = "M4S";
      info.url = i.baseUrl;
      info.audioUrl = audioUrls?.[0]?.baseUrl;
      return info;
    });
  },
  getBilibiliVideo() {
    const videoInfo = Array.from(window.document.scripts).find((i) =>
      i.innerHTML.trim().startsWith("window.__playinfo__"),
    );
    if (videoInfo) {
      const videoDataStr = videoInfo.innerHTML.replace(
        "window.__playinfo__=",
        "",
      );
      try {
        const data = JSON.parse(videoDataStr);
        return this.parseBiliData(data);
      } catch (e) {
        return [];
      }
    }
  },
};

export default Utils;
