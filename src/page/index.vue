<template>
    <div id="crab-root" class="pointer-events-none" @keydown.stop @keyup.stop>
        <div v-show="ffandownTool" ref="crabRef"
            class="sm:w-8 sm:h-8 md:w-8 md:h-8 fixed right-4 bottom-12 w-12 h-12 bg-white rounded-full shadow-2xl shadow-black px-2 py-2 z-50 cursor-pointer pointer-events-auto"
            style="z-index: 33199" @click="toggleBtn" @touchstart.stop="toggleBtn">
            <svg t="1715233840752" class="w-full h-full" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="981" width="200" height="200">
                <path
                    d="M832 810.666667H725.333333v-302.933334a2.858667 2.858667 0 0 0-5.589333-0.853333 128.042667 128.042667 0 0 1-129.28 90.282667A132.864 132.864 0 0 1 469.333333 462.08V426.666667a298.666667 298.666667 0 0 0-298.666666 298.666666v42.666667a170.666667 170.666667 0 0 0 170.666666 170.666667h152.704a42.453333 42.453333 0 0 1-24.704-38.4V853.333333h85.333334v46.933334a42.453333 42.453333 0 0 1-24.704 38.4h134.741333a42.453333 42.453333 0 0 1-24.704-38.4V853.333333h85.333333v46.933334a42.453333 42.453333 0 0 1-24.704 38.4H832a64 64 0 0 0 0-128zM554.666667 170.666667l-128 85.333333V94.165333a21.333333 21.333333 0 0 1 36.437333-15.061333zM640 170.666667l128 85.333333V94.165333a21.333333 21.333333 0 0 0-36.437333-15.061333z"
                    p-id="982"></path>
                <path
                    d="M725.333333 170.666667h-298.666666v128a170.666667 170.666667 0 0 0 341.333333 0V170.666667z m-202.666666 149.333333a32 32 0 1 1 32-32 32 32 0 0 1-32 32z m160 0a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"
                    p-id="983"></path>
            </svg>
            <!-- 查看资源/设置 -->
            <div :class="{ show: showFastBtn }"
                class="flex flex-col rounded-md absolute right-16 bottom-0 z-50 bg-white opacity-0 shadow-2xl shadow-black">
                <div class="w-full flex items-center px-2 py-2 cursor-pointer rounded-md hover:bg-slate-100"
                    v-for="btn in fastBtns" :key="btn.code" @click.stop="btn?.action" @touchstart.stop="btn?.action">
                    <span class="w-4 h-4 mb-1" v-html="btn.icon"></span>
                    <span class="ml-2 w-16 text-sm leading-4">{{ btn.name }}</span>
                </div>
            </div>
        </div>
        <Dialog v-model:show="showResouce" title="资源">
            <MediaList :list="mediaList"/>
        </Dialog>
        <Dialog v-model:show="showSetting" title="设置">
            <Setting />
        </Dialog>
    </div>
</template>
<script>
import mitter from "../bin/mitter.js";
import utils from "../bin/utils.js"
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import Dialog from "./Dialog.vue";
import Setting from "./Setting.vue";
import MediaList from "./MediaList.vue";
export default defineComponent({
    components: { Dialog, Setting, MediaList },
    setup() {
        const ffandownTool = ref(false);
        const showFastBtn = ref(false);
        const showSetting = ref(false);
        const showResouce = ref(false);
        const isDragging = ref(false);
        const crabRef = ref(null);
        const mediaList = ref([]);
        const fastBtns = ref([
            {
                name: "查看资源",
                icon: '<svg t="1715241176671" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2820" width="20" height="20"><path d="M792 64H120c-30.93 0-56 25.07-56 56v784c0 30.93 25.07 56 56 56h784c30.93 0 56-25.07 56-56V232H848c-30.93 0-56-25.07-56-56V64z" fill="#8C9EFF" p-id="2821"></path><path d="M302 64h420v308c0 15.46-12.54 28-28 28H330c-15.46 0-28-12.54-28-28V64z" fill="#FFFFFF" p-id="2822"></path><path d="M232 960h560V568c0-15.46-12.54-28-28-28H260c-15.46 0-28 12.54-28 28v392z" fill="#E1F5FF" p-id="2823"></path><path d="M330 756.38h364c15.46 0 28 12.54 28 28v14c0 15.46-12.54 28-28 28H330c-15.46 0-28-12.54-28-28v-14c0-15.47 12.54-28 28-28zM330 616.38h364c15.46 0 28 12.54 28 28s-12.54 28-28 28H330c-15.46 0-28-12.54-28-28 0-15.47 12.54-28 28-28z" fill="#FFD600" p-id="2824"></path><path d="M624 288h-14c-15.46 0-28-12.54-28-28v-56c0-15.46 12.54-28 28-28h14c15.46 0 28 12.54 28 28v56c0 15.46-12.54 28-28 28z" fill="#313FA0" p-id="2825"></path><path d="M792 64v112c0 30.93 25.07 56 56 56h112L792 64z" fill="#E1F5FF" p-id="2826"></path></svg>',
                code: "source",
                action() {
                    showResouce.value = true;
                    showFastBtn.value = false;
                },
            },
            {
                name: "设置",
                icon: '<svg t="1715241193610" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2986" width="20" height="20"><path d="M858.75 512c0-58.97 44.19-107.53 101.25-114.6-10.91-42.77-27.84-83.1-49.74-120.16-19.48 14.95-43.78 23.94-70.24 23.94-63.83 0-115.58-51.75-115.58-115.58 0-26.67 9.13-51.16 24.3-70.72C711.14 92.41 670.12 75.1 626.6 64c-7.08 57.05-55.63 101.25-114.6 101.25-58.97 0-107.53-44.19-114.6-101.25-42.86 10.93-83.27 27.91-120.4 49.87 14.2 19.2 22.7 42.87 22.7 68.58 0 63.84-51.75 115.58-115.58 115.58-25.93 0-49.79-8.64-69.07-23.07C92.5 312.64 75.13 353.77 64 397.4c57.06 7.07 101.25 55.63 101.25 114.6S121.06 619.53 64 626.6c10.98 43.07 28.07 83.68 50.19 120.96 19.71-15.62 44.58-25.01 71.67-25.01 63.84 0 115.58 51.75 115.58 115.58 0 27.1-9.4 51.97-25.01 71.68 37.28 22.12 77.89 39.21 120.96 50.19 7.07-57.05 55.63-101.25 114.6-101.25 58.97 0 107.53 44.19 114.6 101.25 43.44-11.08 84.39-28.35 121.93-50.75-12.89-18.64-20.47-41.23-20.47-65.61 0-63.84 51.75-115.58 115.58-115.58 24.38 0 46.96 7.59 65.61 20.47 22.4-37.54 39.67-78.49 50.75-121.93-57.04-7.07-101.24-55.63-101.24-114.6z" fill="#8C9EFF" p-id="2987"></path><path d="M512 512m-140 0a140 140 0 1 0 280 0 140 140 0 1 0-280 0Z" fill="#FFD600" p-id="2988"></path><path d="M512 680c-92.63 0-168-75.36-168-168 0-92.63 75.37-168 168-168s168 75.37 168 168c0 92.64-75.37 168-168 168z m0-280c-61.76 0-112 50.24-112 112s50.24 112 112 112 112-50.24 112-112-50.24-112-112-112z" fill="#FFFFFF" p-id="2989"></path></svg>',
                code: "setting",
                action() {
                    showSetting.value = true;
                    showFastBtn.value = false;
                },
            },
        ]);
        const toggleBtn = utils.debounce(() => {
            if (!isDragging.value) showFastBtn.value = !showFastBtn.value
        }, 100)
    
        // 监听快捷按钮的拖拽
        function makeDraggable(target) {
            isDragging.value = false;
            let offsetX = 0;
            let offsetY = 0;

            const isMobile = isMobileDevice();
            function isMobileDevice() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }
            // 统一处理指针起始事件
            function handleStart(e) {
                // 移动端获取第一个触摸点
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                // 计算元素偏移量（点击位置距元素左上角的距离）
                offsetX = clientX - target.offsetLeft;
                offsetY = clientY - target.offsetTop;
                isDragging.value = true;

                // 防止移动端屏幕滚动
                e.preventDefault();
            }

            // 统一处理指针移动事件
            function handleMove(e) {
                if (!isDragging.value) return;

                // 处理兼容性获取坐标
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                // 计算元素新位置（需要处理超出屏幕的情况）
                let newX = clientX - offsetX;
                let newY = clientY - offsetY;

                // 限制边界（可根据需要调整）
                newX = Math.max(0, Math.min(newX, window.innerWidth - target.offsetWidth));
                newY = Math.max(0, Math.min(newY, window.innerHeight - target.offsetHeight));

                target.style.left = `${newX}px`;
                target.style.top = `${newY}px`;
                
                e.preventDefault();
            }

            // 统一处理指针结束事件
            function handleEnd() {
                isDragging.value = false;
            }

            if (isMobile) {
                target.addEventListener('touchstart', handleStart, {passive: false});
                document.addEventListener('touchmove', handleMove, {passive: false});
                document.addEventListener('touchend', handleEnd);
            } else {
                // 事件监听（同时支持移动端和桌面端）
                target.addEventListener('mousedown', handleStart);
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
            }
        }

        const getJsonData = (data) => {
            try {
                return JSON.parse(data)
            } catch {
                return null
            }
        }

        onMounted(() => {
            // 判断是否为 iframe 嵌入
            const isIframe = window.self !== window.top;
            // 只有在非 iframe 或允许在 iframe 中显示时才初始化
            if (!isIframe) {
                // 监听 iframe 的消息只需要在上层窗口执行
                window.addEventListener('message', handleIframeMessage);
                makeDraggable(crabRef.value);
                // 如果数据层发送了 haveMedia 消息表示需要展示快捷按钮
                mitter.on("haveMedia", (val) => { ffandownTool.value = val});
            } else {
                // 在 iframe 内不展示快捷按钮，iframe 内监听到的媒体数据都给上层窗口
                ffandownTool.value = false;
            }
            mitter.emit("getMedia", (list) => {
                // 更新当前的媒体列表
                mediaList.value = list;
            });
            mitter.on("sendMedia", (media) => {
                mediaList.value = media;
            });
            // makeDraggable(crabRef.value);
            // mitter.on("haveMedia", (val) => (ffandownTool.value = val));
        });
        // 清理事件监听
        onUnmounted(() => {
            window.removeEventListener('message', handleIframeMessage);
        });
        // 监听 iframe 发送过来的消息
        const handleIframeMessage = (event) => {
            const messageData = getJsonData(event.data)
            // 如果 iframe 上抛了媒体数据，那么添加到媒体列表内
            if (messageData && messageData.type === 'ffandown_media') {
                mediaList.value = messageData.data;
                // 如果没有显示按钮，那么先展示按钮
                if (!ffandownTool.value) ffandownTool.value = true;
            }
        };
        return {
            fastBtns,
            ffandownTool,
            showFastBtn,
            showSetting,
            showResouce,
            crabRef,
            mediaList,
            toggleBtn,
        };
    },
});
</script>
