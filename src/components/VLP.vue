<template>
  <div>
    <div v-show="lp.objective">Objective: <v-math :math="lp.objective" :inline="true"></v-math></div>
    <div v-show="lp.constraints">Constraints:<v-math :math="lp.constraints"></v-math></div>
  </div>
</template>

<script lang="ts">
///<reference path="../mathjax.d.ts"/>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import VMath from './VMath.vue'


@Component({
  components: {
    VMath
  }
})
export default class VLP extends Vue {
  @Prop()
  private lp!: {
    objective: string
    constraints: string
  }
}
</script>
