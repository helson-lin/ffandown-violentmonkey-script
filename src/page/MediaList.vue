<template>
    <div class="flex flex-col  overflow-y-scroll max-h-96">
        <div class="flex items-center border-b border-gray-300 py-2 hover:bg-slate-100" v-for="(item, index) in mediaList" :key="index">
            <!-- url -->
            <span class="text-sm w-72  leading-4 px-2 flex-1 text-ellipsis overflow-hidden text-nowrap" @click="copy(item.url)">{{ item.url }}</span>
            <!-- type -->
            <span class="tex-sm w-28">类型: {{ item.type }}</span>
            <!-- duration -->
            <span class="text-sm w-36">时长: {{ item.duration }}</span>
            <button class="px-2 py-1 bg-indigo-400 hover:bg-indigo-500 mx-2 outline-none rounded-md text-white" @click="sendDownload(item, index)">下载</button>
        </div>
    </div>
</template>
<script>
import { defineComponent, onMounted, ref } from "vue";
import mitter from "../bin/mitter.js";
import Utils from "../bin/utils.js";
export default defineComponent({
    setup() {
        const mediaList = ref([]);
        onMounted(() => {
            mitter.emit("getMedia", (list) => {
                mediaList.value = list;
            });
            mitter.on("sendMedia", (media) => {
                mediaList.value = media;
            });
        });
        const copy = (url) => {
            Utils.copyText(url);
            Utils.message("复制成功", "success");
        };
        const sendDownload = (data, index) => {
            mitter.emit("sendDownload", { data, index });
        };
        return {
            sendDownload,
            copy,
            mediaList,
        };
    },
});
</script>
