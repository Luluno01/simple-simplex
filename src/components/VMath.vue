<template>
  <div :style="inline ? 'display: inline;' : 'display: block;'" ref="container" v-html="mml"></div>
</template>

<script lang="ts">
///<reference path="../mathjax.d.ts"/>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'


@Component
export default class VMath extends Vue {
  @Prop()
  private math!: string
  @Prop({
    default: false
  })
  private inline!: boolean

  private get mml() {
    const _mml = window.MathJax.tex2mml(this.math)
    return this.inline ? _mml.replace('display="block"', 'display="inline"') : _mml
  }

  @Watch('math')
  private async onMathChange(newMath: string) {
    await this.$nextTick()
    window.MathJax.typesetClear()
    window.MathJax.typeset()
  }
}
</script>
