# TypeScript Types - Important Note

## Current State

The test file currently uses `Program<Idl>` as a generic type because the type definitions haven't been generated yet.

## After Building

Once you run `anchor build`, the following file will be generated:
- `target/types/chocochoco_game.ts`

Then you can update `tests/chocochoco.ts`:

```typescript
// Replace this:
import { Program, Idl } from "@coral-xyz/anchor";
const program = anchor.workspace.ChocoChocoGame as Program<Idl>;

// With this:
import { ChocoChocoGame } from "../target/types/chocochoco_game";
import { Program } from "@coral-xyz/anchor";
const program = anchor.workspace.ChocoChocoGame as Program<ChocoChocoGame>;
```

This will give you full type safety and autocomplete!

## To Build

```bash
cd contracts
anchor build
```

This generates:
- `target/deploy/chocochoco_game.so` - Compiled program
- `target/idl/chocochoco_game.json` - IDL (like ABI)
- `target/types/chocochoco_game.ts` - TypeScript types
