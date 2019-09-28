interface LPMath {
  objective: string
  constraints: string
}

type LPStep = [ LPMath | null, /* narrative */ string, /* pre-narrative */ string ]
