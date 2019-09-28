<template>
  <div>
    <p>{{ lpStep[2] }}</p>
    <h3>{{ lpStep[1] }}</h3>
    <v-l-p v-if="lpStep[0]" :lp="lpStep[0]"></v-l-p>
  </div>
</template>

<script lang="ts">
///<reference path="../global.d.ts"/>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import VLP from './VLP.vue'


@Component({
  components: {
    VLP
  }
})
export default class VStep extends Vue {
  @Prop()
  private lpStep: LPStep | undefined
}
</script>
