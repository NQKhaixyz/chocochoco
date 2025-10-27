export type ChocoChocoGame = {
  "version": "0.1.0",
  "name": "chocochoco_game",
  "instructions": [
    {
      "name": "initializeRound",
      "accounts": [],
      "args": []
    },
    {
      "name": "commitMeow",
      "accounts": [],
      "args": []
    },
    {
      "name": "revealMeow",
      "accounts": [],
      "args": []
    },
    {
      "name": "finalizeRound",
      "accounts": [],
      "args": []
    },
    {
      "name": "claimTreat",
      "accounts": [],
      "args": []
    }
  ],
  "accounts": [],
  "types": [],
  "events": [
    {
      "name": "RoundCreated",
      "fields": [
        {
          "name": "roundId",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundAddress",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "startTime",
          "type": "i64",
          "index": false
        }
      ]
    }
  ]
}

export const IDL: ChocoChocoGame = {
  "version": "0.1.0",
  "name": "chocochoco_game",
  "instructions": [
    {
      "name": "initializeRound",
      "accounts": [],
      "args": []
    },
    {
      "name": "commitMeow",
      "accounts": [],
      "args": []
    },
    {
      "name": "revealMeow",
      "accounts": [],
      "args": []
    },
    {
      "name": "finalizeRound",
      "accounts": [],
      "args": []
    },
    {
      "name": "claimTreat",
      "accounts": [],
      "args": []
    }
  ],
  "accounts": [],
  "types": [],
  "events": [
    {
      "name": "RoundCreated",
      "fields": [
        {
          "name": "roundId",
          "type": "u64",
          "index": false
        },
        {
          "name": "roundAddress",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "startTime",
          "type": "i64",
          "index": false
        }
      ]
    }
  ]
}
