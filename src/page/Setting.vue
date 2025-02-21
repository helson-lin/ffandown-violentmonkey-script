<template>
    <div class="flex flex-col py-2 px-2 w-96">
        <div class="flex flex-col mb-2">
            <label class="text-base mb-2 block">请求地址:</label>
            <input class="w-full text-base outline-none border border-gray-300 rounded-md py-1.5 px-1.5 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400  focus:border-indigo-400 sm:text-sm sm:leading-6"  v-model="serverUrl" type="text" id="input-group-1" placeholder="请输入请求地址">
        </div>
        <div class="flex flex-col mb-2">
            <label class="text-base mb-2 block">请求方式:</label>
            <Select :list="requestMethods" v-model:value="requestMethod"></Select>
        </div>
        <div class="flex flex-col">
            <label class="text-base mb-2 block">请求参数:</label>
            <textarea class="w-full outline-none border border-gray-300 text-base rounded-md py-1.5 px-1.5 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400  focus:border-indigo-400 sm:text-sm sm:leading-6"  v-model="requestParams"  rows="3" id="input-group-1" placeholder="请输入服务器地址"/>
        </div>
    </div>
</template>
<script>
import mitter from '../bin/mitter.js'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import Select from './Select.vue';
export default defineComponent({
    components: {
        Select
    },
    setup() {
        const requestMethods = ['GET', 'POST']
        const serverUrl = ref('')
        const requestMethod = ref('POST')
        const requestParams = ref('{"name": "$name", "url": "$url"}')
        onMounted(() => {
            // 获取服务器配置信息
            // emit表示抛出事件，然后拿到数据
            mitter.emit('getServerConfig',({url, method, params}) => {
                serverUrl.value = url
                requestMethod.value = method
                requestParams.value = params
            })
        })
        onUnmounted(() => {
            // 更新服务器配置信息到本地
            mitter.emit('setServerConfig', {
                url: serverUrl.value,
                method: requestMethod.value,
                params: requestParams.value
            })
        })
        return {
            requestMethods,
            requestMethod,
            requestParams,
            serverUrl
        }
    }
})
</script>