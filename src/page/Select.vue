<template>
    <div class="relative">
        <div class="w-full text-base rounded-md border border-gray-300 py-1.5 px-1.5  text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset active:ring-indigo-400 sm:text-sm sm:leading-6" @click="show = !show"> {{ value }}
        </div>
        <ul class="absolute top-12 w-full bg-white shadow-2xl rounded-md" v-if="show">
            <li class="py-2 px-2 w-full text-base hover:bg-slate-200 text-left rounded-md" v-for="(item, index) in list" :key="index" @click="choose(item)">
                {{ item }}
            </li>
        </ul>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const props = defineProps({
    list: {
        type: Array
    },
    value: {
        type: String
    }
})

const emit = defineEmits(['update:title'])

const show = ref(false)

const choose = (item) => {
    emit('update:value', item)// 传递给父组件
    show.value = false
}

</script>