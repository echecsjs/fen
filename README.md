# @echecs/fen

Parse and stringify
[FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation)
(Forsyth-Edwards Notation) chess positions. Strict TypeScript, no-throw API.

## Install

```bash
npm install @echecs/fen
```

## Usage

### Parsing

```typescript
import { parse } from '@echecs/fen';

const position = parse(
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
);
// => { board, turn, castlingRights, enPassantSquare, halfmoveClock, fullmoveNumber }

parse('invalid');
// => null
```

`parse` never throws. It returns `null` when the input is not a valid FEN
string.

#### Error and warning callbacks

Errors indicate invalid FEN syntax — the string cannot be parsed. Warnings
indicate a successfully parsed position that is suspicious (e.g. missing king).

```typescript
const position = parse(fen, {
  onError(error) {
    // FEN is malformed — parse returns null.
    console.error(`[${error.offset}] ${error.message}`);
  },
  onWarning(warning) {
    // FEN is valid but the position is suspicious.
    console.warn(warning.message);
  },
});
```

Errors are reported for:

- Wrong number of fields
- Invalid piece placement (bad piece type, wrong rank length)
- Invalid active color
- Invalid castling availability
- Invalid en passant target square
- Invalid halfmove clock (non-numeric or negative)
- Invalid fullmove number (non-numeric or less than 1)

Warnings are reported for:

- Missing king for either side
- Pawn on rank 1 or 8
- More than 8 pawns per side
- More than 16 pieces per side

### Stringifying

```typescript
import { stringify } from '@echecs/fen';

stringify(position);
// => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
```

`stringify` always succeeds.

### Constants

```typescript
import { STARTING_FEN } from '@echecs/fen';

STARTING_FEN;
// => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
```

## API

### `parse(input: string, options?: ParseOptions): Position | null`

Parses a FEN string into a `Position` object. Returns `null` if the input is not
a valid FEN string.

> **Deprecated:** The default export (`import parse from '@echecs/fen'`) is
> deprecated. Use the named export instead:
> `import { parse } from '@echecs/fen'`.

### `stringify(position: Position): string`

Serializes a `Position` object into a FEN string.

### `STARTING_FEN`

The FEN string for the standard starting position.

### Types

All types are named exports and can be imported directly:

```typescript
import type {
  CastlingRights,
  Color,
  EnPassantSquare,
  File,
  ParseError,
  ParseOptions,
  ParseWarning,
  Piece,
  PieceType,
  Position,
  Rank,
  SideCastlingRights,
  Square,
} from '@echecs/fen';
```

```typescript
interface Position {
  board: ReadonlyMap<Square, Piece>;
  castlingRights: CastlingRights;
  enPassantSquare: EnPassantSquare | undefined;
  fullmoveNumber: number;
  halfmoveClock: number;
  turn: Color;
}

interface ParseOptions {
  onError?: (error: ParseError) => void;
  onWarning?: (warning: ParseWarning) => void;
}

interface ParseError {
  column: number; // 1-indexed column in the FEN string
  line: number; // Always 1 (FEN is single-line)
  message: string;
  offset: number; // 0-indexed offset into the FEN string
}

interface ParseWarning {
  column: number;
  line: number;
  message: string;
  offset: number;
}

type Color = 'black' | 'white';
type Square = `${File}${Rank}`;
type EnPassantSquare = `${File}${'3' | '6'}`;
type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type PieceType = 'bishop' | 'king' | 'knight' | 'pawn' | 'queen' | 'rook';

interface Piece {
  color: Color;
  type: PieceType;
}

interface SideCastlingRights {
  king: boolean;
  queen: boolean;
}

interface CastlingRights {
  black: SideCastlingRights;
  white: SideCastlingRights;
}
```

## License

MIT
