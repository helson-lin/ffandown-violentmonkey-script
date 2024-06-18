<template>
    <div class="crab-dialog" v-if="show" @click="dialogClick">
        <div class="crab-dialog-inner">
            <div class="crab-dialog-inner-header">
                <div class="text-md">{{ title }}</div>
                <div class="close-icon crab-icon" @click="close">
                    <svg t="1715249520484" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1041" width="20" height="20"><path d="M567.192 513.223l209.774-209.774c15.55-15.551 15.55-40.763 0-56.313-15.551-15.55-40.762-15.55-56.313 0L510.879 456.91 301.104 247.136c-15.551-15.55-40.762-15.55-56.313 0-15.55 15.55-15.55 40.763 0 56.313l209.774 209.774-209.774 209.775c-15.55 15.55-15.55 40.763 0 56.313 7.775 7.775 17.966 11.663 28.157 11.663 10.191 0 20.381-3.887 28.157-11.663l209.774-209.774 209.774 209.774c7.776 7.776 17.965 11.663 28.157 11.663 10.189 0 20.382-3.889 28.157-11.663 15.55-15.55 15.55-40.763 0-56.313L567.192 513.223z" fill="" p-id="1042"></path></svg>
                </div>
            </div>
            <div class="crab-dialog-inner-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Dialog',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        }
    },
    setup(_, ctx) {
        const dialogClick = (ev) => {
            const element = ev.target
            const isOuter = Array.from(element.classList).includes('crab-dialog')
            if (isOuter) ctx.emit('update:show', false)
        }
        const close = () => {
            ctx.emit('update:show', false)
        }
        return {
            dialogClick,
            close
        }
    }
})
</script>