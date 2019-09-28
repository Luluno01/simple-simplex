<template>
  <div id="app">
    <el-container>
      <el-main>
        <div class="main">
          <el-row :style="`height: ${padding};`"></el-row>
          <el-row type="flex" justify="space-around">
            <el-col :xs="20" :sm="16" :md="12">
              <el-form ref="form" label-position="left" label-width="7em">
                <el-form-item label="Ojbective" class="objective">
                  <el-row type="flex" justify="space-around" :gutter="5">
                    <el-col :span="21"><el-input v-model="objective" placeholder="2 * x1 + 3 * x2"></el-input></el-col>
                    <el-col :span="3">
                      <el-tooltip effect="dark" content="Clear Objective" placement="top">
                        <el-button icon="el-icon-close" circle @click.prevent="objective = ''"></el-button>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item
                  v-for="(constraint, i) in constraints"
                  :key="i"
                  :label="`Constraint ${i + 1}`"
                  :prop="'constraint.val'"
                  class="constraints"
                >
                  <el-row type="flex" justify="space-around" :gutter="5">
                    <el-col :span="3"><el-input v-model="constraint.lhs" placeholder="w1"></el-input></el-col>
                    <el-col :span="1" style="text-align: center;">=</el-col>
                    <el-col :span="17"><el-input v-model="constraint.rhs" placeholder="6 - 2 * x1 - 3 * x2"></el-input></el-col>
                    <el-col :span="3">
                      <el-tooltip effect="dark" content="Delete Constraint" placement="top">
                        <el-button icon="el-icon-delete" circle v-show="constraints.length > 1" @click.prevent="removeConstraint(i)"></el-button>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item>
                  <el-row type="flex" justify="flex-start" :gutter="5">
                    <el-col :span="21">
                      <el-tooltip effect="dark" content="Add Objective" placement="top">
                        <el-button class="add-constraint" icon="el-icon-plus" @click="addConstraint"></el-button>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item>
                  <el-row type="flex" justify="space-around" :gutter="5">
                    <el-col :span="21">
                      <el-tooltip effect="dark" content="Solve" placement="top">
                        <el-button type="primary" class="solve" @click.stop="solve">Go!</el-button>
                      </el-tooltip>
                    </el-col>
                    <el-col :span="3">
                      <el-tooltip effect="dark" content="Load Example" placement="top">
                        <el-button icon="el-icon-files" circle @click.prevent="loadExample"></el-button>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-form>
              <el-tabs v-show="lpMathOrigin.objective">
                <el-tab-pane label="Human">
                  <v-step
                    v-for="(step, i) in lpSteps"
                    :key="i"
                    :lpStep="step"
                  >
                  </v-step>
                </el-tab-pane>
                <el-tab-pane label="ASCII"><pre>{{ lpASCII }}</pre></el-tab-pane>
                <el-tab-pane label="LaTex"><pre>{{ lpLaTex }}</pre></el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </div>
      </el-main>
      <el-footer height="1.75em" class="footer">&copy;<a href="https://blog.untitled.vip/" target="_blank" style="margin-left: 0.25em; margin-right: 0.25em;">Untitled</a> {{ (new Date).getFullYear() }}</el-footer>
    </el-container>
  </div>
</template>

<script lang="ts">
///<reference path="./shims-simplex.d.ts"/>
///<reference path="./global.d.ts"/>
///<reference path="../node_modules/element-ui/types/notification.d.ts"/>
import { Component, Prop, Vue } from 'vue-property-decorator'
import VStep from '@/components/VStep.vue'
import * as algebra from 'algebra.js'
import { Expression, Equation } from 'algebra.js'
import { LinearProgram, Result } from 'simplex'
import {
  expressionToMath,
  expressionToASCII,
  equationToMath,
  equationToASCII,
  linearProgramToASCII,
  linearProgramToLaTex,
  fracToMath,
  objectiveToMath,
  constraintsToMath,
  toLPMath
} from './formatters'


@Component({
  components: {
    VStep
  }
})
export default class App extends Vue {
  objective: string = ''
  constraints: { lhs: string, rhs: string }[] = [
    { lhs: 'w1', rhs: '' }
  ]
  lpMathOrigin: LPMath = {
    objective: '',
    constraints: ''
  }
  lpSteps: LPStep[] = []
  lpASCII: string = ''
  lpLaTex: string = ''

  removeConstraint(i: number) {
    this.constraints.splice(i, 1)
  }

  addConstraint() {
    const { constraints } = this
    const basics = new Set<string>()
    for(const { lhs } of constraints) {
      basics.add(lhs.trim())
    }
    let i = 1
    let lhs: string
    while(basics.has(lhs = `w${i}`)) i++
    this.constraints.push({ lhs, rhs: '' })
  }

  compactConstraints() {
    const { constraints } = this
    let delIndex: number[] = []
    constraints.forEach(({ rhs }, i) => {
      if(!rhs.trim()) delIndex.push(i)
    })
    let offset = 0
    for(const i of delIndex) {
      constraints.splice(i - offset, 1)
      offset++
    }
  }

  loadExample() {
    this.objective = '-3 * x1 + 4 * x2'
    const { constraints } = this
    constraints.splice(0, constraints.length)
    const exampleConstraints: { lhs: string, rhs: string }[] = [
      { lhs: 'w1', rhs: '-8 + 4 * x1 + 2 * x2' },
      { lhs: 'w2', rhs: '-2 + 2 * x1' },
      { lhs: 'w3', rhs: '10 - 3 * x1 - 2 * x2' },
      { lhs: 'w4', rhs: '1 + x1 - 3 * x2' },
      { lhs: 'w5', rhs: '-2 + 3 * x2' }
    ]
    for(const cons of exampleConstraints) constraints.push(cons)
  }

  solve() {
    try {
      this._solve()
    } catch(err) {
      this.notifyError('Opps', 'We are sorry but something went wrong<br>If you believe this is a bug, please open an issue on <a href="https://github.com/Luluno01/simple-simplex" target="_blank">simple-simplex</a>')
    }
  }

  private _solve() {
    this.objective = this.objective.trim()
    const { objective: objStr } = this
    if(!objStr) {
      this.notifyError('Invalid objective', 'We are sorry but objective function is non-optional')
      return
    }
    let objective: Expression
    try {
      objective = <Expression>algebra.parse(objStr)
      if(objective instanceof Equation) {
        this.notifyError('Invalid objective', 'The objective function should be an expression instead of an equation')
        return
      }
    } catch(err) {
      this.notifyError('Invalid objective', 'The objective function is not a valid expression')
      return
    }
    const variables = 0
    const nonBasics = new Set<string>()
    for(const { variables: [ { variable } ] } of objective.terms) {
      nonBasics.add(variable)
    }
    this.compactConstraints()
    if(!this.constraints.length) {
      this.notifyError('Invalid constraint', 'At least one constraint is required')
      this.constraints.push({ lhs: 'w1', rhs: '' })
      return
    }
    const { constraints: consStrs } = this
    const constraints: Equation[] = []
    let num = 0
    const basics = new Set<string>()
    for(const { lhs, rhs } of consStrs) {
      num++
      let cons: Equation
      try {
        cons = <Equation>algebra.parse(`${lhs} = ${rhs}`)
      } catch(err) {
        this.notifyError('Invalid constraint', `Please check Constraint ${num}`)
        return
      }
      if(basics.has(lhs)) {
        this.notifyError('Invalid constraint', `Basic variable name of Constraint ${num} is duplicated`)
        return
      }
      if(cons.lhs.constants.length || cons.lhs.terms.length != 1) {
        this.notifyError('Invalid constraint', `Left hand side of Constraint ${num} must be a single basic variable (e.g. w1)`)
        return
      }
      basics.add(lhs)
      for(const { variables: [ { variable } ] } of cons.rhs.terms) {
        nonBasics.add(variable)
      }
      if(nonBasics.has(lhs)) {
        this.notifyError('Invalid constraint', `Basic variable of Constraint ${num} is also a non-basic variable`)
        return
      }
      constraints.push(cons)
    }
    const lp = new LinearProgram({
      variables: nonBasics.size,
      objective,
      constraints
    })
    const { lpSteps } = this
    lpSteps.splice(0, lpSteps.length)
    lpSteps.push([ toLPMath(lp), 'Original dictionary', '' ])
    this.lpASCII = `Original dictionary
${linearProgramToASCII(lp)}`
    this.lpLaTex = `Original dictionary

${linearProgramToLaTex(lp)}`
    let lastSignature = lp.objective.toString()
    let pivot = 1
    const pivots: number[] = []
    for(const [ _lp, res ] of lp.solve()) {
      const signature = _lp.objective.toString()
      if(signature == lastSignature) {
        switch(res) {
          case Result.OPTIMAL: {
            lpSteps.push([ null, '', 'Optimal.' ])
            this.lpASCII += `\nOptimal.`
            this.lpLaTex += `\n\nOptimal.`
            pivot = pivots.pop() || 1
            break
          }
          case Result.OPTIMIZABLE: {
            // Should be impossible
            console.warn('The `impossible\' happened')
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (optimizable)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (optimizable)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (optimizable)\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.UNBOUNDED: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (unbounded)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (unbounded)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (unbounded)\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.INFEASIBLE: {
            lpSteps.push([ toLPMath(_lp), '', 'The dictonary is infeasible.' ])
            this.lpASCII += `\nThe dictonary is infeasible.`
            this.lpLaTex += `\n\nThe dictonary is infeasible.`
            break
          }
          case Result.HELP_NEEDED: {
            lpSteps.push([ null, '', 'This basic solution is infeasible, introduce a helper variable' ])
            this.lpASCII += `\nThis basic solution is infeasible, introduce a helper variable`
            this.lpLaTex += `\n\nThis basic solution is infeasible, introduce a helper variable`
            break
          }
          case Result.HELPER_CREATED: {
            // Should be impossible
            console.warn('The `impossible\' happened')
            lpSteps.push([ toLPMath(_lp), 'Helper dictionary', '' ])
            this.lpASCII += `\n\nHelper dictionary\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nHelper dictionary\n\n${linearProgramToLaTex(_lp)}`
            pivots.push(pivot)
            pivot = 1
            break
          }
          case Result.HELPER_FEASIBLE: {
            // Should be impossible
            console.warn('The `impossible\' happened')
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++}: make helper dictionary feasible`, '' ])
            this.lpASCII += `\n\nPivot ${pivot}: make helper dictionary feasible\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot}: make helper dictionary feasible\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.ORIGIN_FEASIBLE: {
            // Should be impossible
            console.warn('The `impossible\' happened')
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++}: make original dictionary feasible`, '' ])
            this.lpASCII += `\n\nPivot ${pivot}: make original dictionary feasible\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot}: make original dictionary feasible\n\n${linearProgramToLaTex(_lp)}`
            break
          }
        }
      } else {
        switch(res) {
          case Result.OPTIMAL: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (optimal)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (optimal)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (optimal)\n\n${linearProgramToLaTex(_lp)}`
            pivot = pivots.pop() || 1
            break
          }
          case Result.OPTIMIZABLE: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (optimizable)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (optimizable)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (optimizable)\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.UNBOUNDED: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (unbounded)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (unbounded)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (unbounded)\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.INFEASIBLE: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++} (infeasible)`, '' ])
            this.lpASCII += `\n\nPivot ${pivot} (infeasible)\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot} (infeasible)\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.HELP_NEEDED: {
            // Should be impossible
            console.warn('The `impossible\' happened')
            lpSteps.push([ null, '', 'This basic solution is infeasible, introduce a helper variable' ])
            this.lpASCII += `\nThis basic solution is infeasible, introduce a helper variable`
            this.lpLaTex += `\n\nThis basic solution is infeasible, introduce a helper variable`
            break
          }
          case Result.HELPER_CREATED: {
            lpSteps.push([ toLPMath(_lp), `Helper dictionary`, '' ])
            this.lpASCII += `\n\nHelper dictionary\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nHelper dictionary\n\n${linearProgramToLaTex(_lp)}`
            pivots.push(pivot)
            pivot = 1
            break
          }
          case Result.HELPER_FEASIBLE: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++}: make helper dictionary feasible`, '' ])
            this.lpASCII += `\n\nPivot ${pivot}: make helper dictionary feasible\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot}: make helper dictionary feasible\n\n${linearProgramToLaTex(_lp)}`
            break
          }
          case Result.ORIGIN_FEASIBLE: {
            lpSteps.push([ toLPMath(_lp), `Pivot ${pivot++}: make original dictionary feasible`, '' ])
            this.lpASCII += `\n\nPivot ${pivot}: make original dictionary feasible\n${linearProgramToASCII(_lp)}`
            this.lpLaTex += `\n\nPivot ${pivot}: make original dictionary feasible\n\n${linearProgramToLaTex(_lp)}`
            break
          }
        }
      }
      lastSignature = signature
    }
    this.lpMathOrigin.objective = objectiveToMath(lp)
    this.lpMathOrigin.constraints = constraintsToMath(lp)
    this.$nextTick(() => {
      window.MathJax.typesetClear()
      window.MathJax.typeset()
    })
  }

  private notifyError(title: string, message: string) {
    this.$notify({
      title,
      type: 'error',
      message,
      duration: 3000,
      dangerouslyUseHTMLString: true
    })
  }

  private get padding() {
    const length = this.constraints.length
    if(length < 4) return '10em'
    else if(length == 4) return '7em'
    else return '3em'
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}

.el-main {
  min-height: calc(100vh - 2 * 8px - 1.75em);
  padding: 0 !important;
  position: relative;
}

.el-main .el-row {
  width: 100%;
}

.footer {
  text-align: end;
  /* background-color: rgb(37, 37, 37); */
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.main {
  position: absolute;
  width: 100%;
  height: 100%;
  /* display: flex; */
  /* justify-content: center; */
  /* align-items: center; */
}

/* .objective .el-input, .constraints .el-input {
  width: calc(100% - 5em);
  margin-right: 1em;
} */

/* .objective input, .constraints input {
  display: inline-block;
} */

.add-constraint {
  width: 100%;
  border: 0.1em dashed #DCDFE6 !important;
}

.solve {
  width: 100%;
}
</style>
