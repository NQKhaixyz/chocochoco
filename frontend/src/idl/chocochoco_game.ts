export type ChocoChocoGame = {
  address: string
  metadata: {
    name: string
    version: string
    spec: string
    description: string
  }
  instructions: Array<any>
  accounts: Array<any>
  types: Array<any>
  events: Array<any>
  errors: Array<any>
}

export const IDL: ChocoChocoGame = {
  address: "7i6gMYfJoAuW52SyZNoy2vYsmLrj1Ea6eRphxBaTa9oo",
  metadata: {
    name: "chocochoco_game",
    version: "0.1.0",
    spec: "0.1.0",
    description: "ChocoChoco - On-chain minority game with commit-reveal"
  },
  instructions: [],
  accounts: [],
  types: [],
  events: [],
  errors: []
}
