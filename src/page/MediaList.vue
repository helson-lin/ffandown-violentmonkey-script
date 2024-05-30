<template>
    <div class="crab-media-list">
        <div class="crab-media" v-for="(item, index) in mediaList" :key="index">
            <!-- url -->
            <span class="url">{{ item.url }}</span>
            <!-- type -->
            <span class="type w-40">Type: {{ item.type }}</span>
            <!-- duration -->
            <span class="duration w-40">Duration: {{ item.duration }}</span>
            <button  @click="sendDownload(item)">Send</button>
        </div>
    </div>
</template>
<script>
import { defineComponent, onMounted, ref } from 'vue';
import mitter from '../mitter.js'
export default defineComponent({
    setup () {
        const mediaList = ref([])
        onMounted(() => {
            mitter.emit('getMedia', (list)=> {
                mediaList.value = list
            })
            mitter.on('sendMedia', (media) => {
                mediaList.value = media
                console.warn(media, mediaList.value)
            })
        })
        const sendDownload = (data) => {
            mitter.emit('sendDownload', data)
        }
        return {
            sendDownload,
            mediaList
        }
    }
})
</script>
