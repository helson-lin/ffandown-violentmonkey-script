<template>
    <div id="crab-root">
        <div v-show="ffandownTool" ref="crabRef" class="btn" @click="toggleBtn">
            <svg t="1715233840752" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="981" width="200" height="200">
                <path
                    d="M832 810.666667H725.333333v-302.933334a2.858667 2.858667 0 0 0-5.589333-0.853333 128.042667 128.042667 0 0 1-129.28 90.282667A132.864 132.864 0 0 1 469.333333 462.08V426.666667a298.666667 298.666667 0 0 0-298.666666 298.666666v42.666667a170.666667 170.666667 0 0 0 170.666666 170.666667h152.704a42.453333 42.453333 0 0 1-24.704-38.4V853.333333h85.333334v46.933334a42.453333 42.453333 0 0 1-24.704 38.4h134.741333a42.453333 42.453333 0 0 1-24.704-38.4V853.333333h85.333333v46.933334a42.453333 42.453333 0 0 1-24.704 38.4H832a64 64 0 0 0 0-128zM554.666667 170.666667l-128 85.333333V94.165333a21.333333 21.333333 0 0 1 36.437333-15.061333zM640 170.666667l128 85.333333V94.165333a21.333333 21.333333 0 0 0-36.437333-15.061333z"
                    p-id="982"></path>
                <path
                    d="M725.333333 170.666667h-298.666666v128a170.666667 170.666667 0 0 0 341.333333 0V170.666667z m-202.666666 149.333333a32 32 0 1 1 32-32 32 32 0 0 1-32 32z m160 0a32 32 0 1 1 32-32 32 32 0 0 1-32 32z"
                    p-id="983"></path>
            </svg>
            <!-- 查看资源/设置 -->
            <div :class="{ 'crab-sliderbar': true, 'show': showFastBtn }">
                <div class="item" v-for="btn in fastBtns" :key="btn.code" @click="btn?.action">
                    <span class="crab-icon" v-html="btn.icon"></span>
                    <span class="text-sm">{{ btn.name }}</span>
                </div>
            </div>
        </div>
        <Dialog v-model:show="showResouce" title="资源">
            <MediaList />
        </Dialog>
        <Dialog v-model:show="showSetting" title="设置">
            <Setting />
        </Dialog>
    </div>
</template>
<script>
import mitter from '../mitter'
import { defineComponent, onMounted, ref } from 'vue'
import Dialog from './Dialog.vue';
import Setting from './Setting.vue';
import MediaList from './MediaList.vue';
export default defineComponent({
    components: { Dialog, Setting, MediaList },
    setup() {
        const ffandownTool = ref(false)
        const showFastBtn = ref(false)
        const showSetting = ref(false)
        const showResouce = ref(false)
        const crabRef = ref(null)
        const fastBtns = ref([
            {
                name: '查看资源',
                icon: '<svg t="1715241176671" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2820" width="20" height="20"><path d="M792 64H120c-30.93 0-56 25.07-56 56v784c0 30.93 25.07 56 56 56h784c30.93 0 56-25.07 56-56V232H848c-30.93 0-56-25.07-56-56V64z" fill="#8C9EFF" p-id="2821"></path><path d="M302 64h420v308c0 15.46-12.54 28-28 28H330c-15.46 0-28-12.54-28-28V64z" fill="#FFFFFF" p-id="2822"></path><path d="M232 960h560V568c0-15.46-12.54-28-28-28H260c-15.46 0-28 12.54-28 28v392z" fill="#E1F5FF" p-id="2823"></path><path d="M330 756.38h364c15.46 0 28 12.54 28 28v14c0 15.46-12.54 28-28 28H330c-15.46 0-28-12.54-28-28v-14c0-15.47 12.54-28 28-28zM330 616.38h364c15.46 0 28 12.54 28 28s-12.54 28-28 28H330c-15.46 0-28-12.54-28-28 0-15.47 12.54-28 28-28z" fill="#FFD600" p-id="2824"></path><path d="M624 288h-14c-15.46 0-28-12.54-28-28v-56c0-15.46 12.54-28 28-28h14c15.46 0 28 12.54 28 28v56c0 15.46-12.54 28-28 28z" fill="#313FA0" p-id="2825"></path><path d="M792 64v112c0 30.93 25.07 56 56 56h112L792 64z" fill="#E1F5FF" p-id="2826"></path></svg>',
                code: 'source',
                action() {
                    showResouce.value = true
                    showFastBtn.value = false
                }
            },
            {
                name: '设置',
                icon: '<svg t="1715241193610" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2986" width="20" height="20"><path d="M858.75 512c0-58.97 44.19-107.53 101.25-114.6-10.91-42.77-27.84-83.1-49.74-120.16-19.48 14.95-43.78 23.94-70.24 23.94-63.83 0-115.58-51.75-115.58-115.58 0-26.67 9.13-51.16 24.3-70.72C711.14 92.41 670.12 75.1 626.6 64c-7.08 57.05-55.63 101.25-114.6 101.25-58.97 0-107.53-44.19-114.6-101.25-42.86 10.93-83.27 27.91-120.4 49.87 14.2 19.2 22.7 42.87 22.7 68.58 0 63.84-51.75 115.58-115.58 115.58-25.93 0-49.79-8.64-69.07-23.07C92.5 312.64 75.13 353.77 64 397.4c57.06 7.07 101.25 55.63 101.25 114.6S121.06 619.53 64 626.6c10.98 43.07 28.07 83.68 50.19 120.96 19.71-15.62 44.58-25.01 71.67-25.01 63.84 0 115.58 51.75 115.58 115.58 0 27.1-9.4 51.97-25.01 71.68 37.28 22.12 77.89 39.21 120.96 50.19 7.07-57.05 55.63-101.25 114.6-101.25 58.97 0 107.53 44.19 114.6 101.25 43.44-11.08 84.39-28.35 121.93-50.75-12.89-18.64-20.47-41.23-20.47-65.61 0-63.84 51.75-115.58 115.58-115.58 24.38 0 46.96 7.59 65.61 20.47 22.4-37.54 39.67-78.49 50.75-121.93-57.04-7.07-101.24-55.63-101.24-114.6z" fill="#8C9EFF" p-id="2987"></path><path d="M512 512m-140 0a140 140 0 1 0 280 0 140 140 0 1 0-280 0Z" fill="#FFD600" p-id="2988"></path><path d="M512 680c-92.63 0-168-75.36-168-168 0-92.63 75.37-168 168-168s168 75.37 168 168c0 92.64-75.37 168-168 168z m0-280c-61.76 0-112 50.24-112 112s50.24 112 112 112 112-50.24 112-112-50.24-112-112-112z" fill="#FFFFFF" p-id="2989"></path></svg>',
                code: 'setting',
                action() {
                    showSetting.value = true
                    showFastBtn.value = false
                }
            }
        ])
        const toggleBtn = () => showFastBtn.value = !showFastBtn.value
        function makeDraggable(element) {
            let isDragging = false;
            let offsetX, offsetY;

            element.addEventListener('touchstart', handleTouchStart);
            element.addEventListener('mousedown', handleMouseDown);

            function handleTouchStart(event) {
                event.preventDefault();
                isDragging = true;
                const touch = event.touches[0];
                offsetX = touch.clientX - element.offsetLeft;
                offsetY = touch.clientY - element.offsetTop;
                element.addEventListener('touchmove', handleTouchMove);
                element.addEventListener('touchend', handleTouchEnd);
            }

            function handleMouseDown(event) {
                event.preventDefault();
                isDragging = true;
                offsetX = event.clientX - element.offsetLeft;
                offsetY = event.clientY - element.offsetTop;
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }

            function handleTouchMove(event) {
                event.preventDefault();
                if (isDragging) {
                    const touch = event.touches[0];
                    element.style.left = (touch.clientX - offsetX) + 'px';
                    element.style.top = (touch.clientY - offsetY) + 'px';
                }
            }

            function handleMouseMove(event) {
                event.preventDefault();
                if (isDragging) {
                    element.style.left = (event.clientX - offsetX) + 'px';
                    element.style.top = (event.clientY - offsetY) + 'px';
                }
            }

            function handleTouchEnd() {
                isDragging = false;
                element.removeEventListener('touchmove', handleTouchMove);
                element.removeEventListener('touchend', handleTouchEnd);
            }

            function handleMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        }

        onMounted(() => {
            console.log(crabRef.value, 'crabBtn')
            makeDraggable(crabRef.value)
            mitter.on('haveMedia', (val) => ffandownTool.value = val)
        })
        return {
            fastBtns,
            ffandownTool,
            showFastBtn,
            showSetting,
            showResouce,
            crabRef,
            toggleBtn
        }
    }
})
</script>
