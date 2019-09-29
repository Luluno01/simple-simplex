///<reference path="./shims-simplex.d.ts"/>
import { Expression, Equation, Fraction } from 'algebra.js'
import { LinearProgram } from 'simplex'


export function expressionToASCII(expr: Expression) {
  let res = ''
  if(expr.constants.length) {
    res = expr.constants[0].toString()
  }
  for(const { variables: [ variable ], coefficients: [ coeff ] } of expr.terms) {
    const coeffAbs = coeff.abs()
    res += ` ${coeff.valueOf() < 0 ? '- ' : (res.length == 0 ? '' : '+ ')}${coeffAbs.valueOf() == 1 ? variable : `${coeffAbs.toString()} * ${variable}`}`
  }
  return res.trimLeft()
}

export function equationToASCII(eq: Equation) {
  return `${expressionToASCII(eq.lhs)} = ${expressionToASCII(eq.rhs)}`
}

export function linearProgramToASCII({ objective, constraints }: LinearProgram) {
  return `Objective: ${expressionToASCII(objective)}\nConstraints:\n${constraints.map(equationToASCII).join('\n')}`
}

export function fracToMath({ numer, denom }: Fraction) {
  // Assert: Positive fraction
  if(denom == 1) {
    return numer.toString()
  }
  return `\\frac{${numer}}{${denom}}`
}

export function expressionToMath(expr: Expression) {
  let res = ''
  if(expr.constants.length) {
    res = expr.constants[0].toString()
  }
  for(const { variables: [ { variable } ], coefficients: [ coeff ] } of expr.terms) {
    const match = variable.match(/^([a-zA-Z_]+)(\d+)$/)
    let varName: string
    if(match) {
      varName = `${match[1].replace('_', '\\_')}_{${match[2]}}`
    } else {
      varName = variable
    }
    const coeffAbs = coeff.abs()
    res += ` ${coeff.valueOf() < 0 ? '- ' : (res.length == 0 ? '' : '+ ')}${coeffAbs.valueOf() == 1 ? varName : `${fracToMath(coeffAbs)} ${varName}`}`
  }
  return res.trimLeft()
}

export function equationToMath(eq: Equation) {
  return `${expressionToMath(eq.lhs)} = ${expressionToMath(eq.rhs)}`
}

export function objectiveToMath({ objective }: LinearProgram) {
  return expressionToMath(objective)
}

export function constraintsToMath({ constraints }: LinearProgram) {
  let multiple = constraints.length > 1
  return `${multiple ? '\\begin{cases}\n' : ''}${constraints.map(cons => equationToMath(cons)).join(' \\\\\n  ')}${multiple ? '\n\\end{cases}' : ''}`
}

export function toLPMath(lp: LinearProgram): LPMath {
  return {
    objective: objectiveToMath(lp),
    constraints: constraintsToMath(lp)
  }
}

export function linearProgramToLaTex({ objective, constraints }: LinearProgram) {
  let multiple = constraints.length > 1
  return `Objective: $${expressionToMath(objective)}$

Constraints:

\\begin{align}${multiple ? '\n\\begin{cases}' : ''}
  ${constraints.map(cons => equationToMath(cons)).join(' \\\\\n  ')}${multiple ? '\n\\end{cases}' : ''}
\\end{align}`
}
