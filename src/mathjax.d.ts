interface MathJax {
  typesetClear(): unknown
  typeset(): void
  typesetPromise(): Promise<void>
  tex2mml(tex: string): string
}

interface Window {
  MathJax: MathJax
}
