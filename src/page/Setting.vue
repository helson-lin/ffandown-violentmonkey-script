<template>
    <div class="crab-setting pb-4">
        <label class="text-sm">服务器:</label>
        <input class="server-url"  v-model="serverUrl" type="text" id="input-group-1" placeholder="请输入服务器地址">
    </div>
</template>
<script>
import mitter from '../mitter'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
export default defineComponent({
    setup() {
        const serverUrl = ref('')
        onMounted(() => {
            mitter.emit('getServerUrl',(url) => {
                serverUrl.value = url
            })
        })
        onUnmounted(() => {
            mitter.emit('serverUrl', serverUrl.value)
        })
        return {
            serverUrl
        }
    }
})
</script>