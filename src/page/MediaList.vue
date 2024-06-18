<template>
    <div class="crab-media-list">
        <div class="crab-media" v-for="(item, index) in mediaList" :key="index">
            <!-- url -->
            <span class="url" @click="copy(item.url)">{{ item.url }}</span>
            <!-- type -->
            <span class="type w-40">Type: {{ item.type }}</span>
            <!-- duration -->
            <span class="duration w-40">Duration: {{ item.duration }}</span>
            <button @click="sendDownload(item, index)">Send</button>
        </div>
    </div>
</template>
<script>
import { defineComponent, onMounted, ref } from "vue";
import mitter from "../mitter.js";
import Utils from "../utils.js";
export default defineComponent({
    setup() {
        const mediaList = ref([]);
        onMounted(() => {
            mitter.emit("getMedia", (list) => {
                mediaList.value = list;
            });
            mitter.on("sendMedia", (media) => {
                mediaList.value = media;
                console.warn(media, mediaList.value);
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
