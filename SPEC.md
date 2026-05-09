# FEN Specification

Forsyth-Edwards Notation (FEN) is a standard notation for describing chess
positions. This document specifies the format as implemented by `@echecs/fen`.

## Source

FEN is defined in the **PGN standard** (Steven J. Edwards, 1994) §16, and
referenced in the **FIDE Laws of Chess** Appendix C.

## FEN String Format

A FEN string consists of **6 space-separated fields**:

```
<placement> <color> <castling> <en-passant> <halfmove> <fullmove>
```

### 1. Piece Placement

Ranks are listed from **rank 8** (black's back rank) to **rank 1** (white's back
rank), separated by `/`.

Within each rank, squares are listed from file `a` to file `h`:

- **Uppercase letters** — white pieces (`K`, `Q`, `R`, `B`, `N`, `P`)
- **Lowercase letters** — black pieces (`k`, `q`, `r`, `b`, `n`, `p`)
- **Digits 1–8** — consecutive empty squares

The digit and piece counts within each rank must sum to exactly 8.

### 2. Active Color

`w` — white to move  
`b` — black to move

### 3. Castling Availability

A combination of `K`, `Q`, `k`, `q` indicating which sides retain castling
rights, or `-` if neither side has any.

| Character | Meaning                    |
| --------- | -------------------------- |
| `K`       | white may castle kingside  |
| `Q`       | white may castle queenside |
| `k`       | black may castle kingside  |
| `q`       | black may castle queenside |
| `-`       | no castling rights remain  |

Order is always `KQkq`; individual characters are omitted when the right is
lost. The field is `-` only when none of the four rights remain.

### 4. En Passant Target Square

The square **behind** the pawn that just advanced two squares, or `-` if no en
passant capture is possible.

- White pawn double advance → target is on **rank 3** (e.g. `e3`)
- Black pawn double advance → target is on **rank 6** (e.g. `e6`)

Only ranks 3 and 6 are valid. The target is recorded regardless of whether an
enemy pawn is actually positioned to capture.

### 5. Halfmove Clock

The number of half-moves (plies) since the last capture or pawn advance. Used to
enforce the **50-move rule** (draw when this value reaches 100). Must be a
non-negative integer.

### 6. Fullmove Number

The number of the current full move. Starts at `1` and is incremented after
**black's** move. Must be a positive integer (≥ 1).

## Starting Position

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

## Grammar (ABNF-style)

```abnf
FEN          = placement SP color SP castling SP en-passant SP halfmove SP fullmove
placement    = rank ("/" rank){7}
rank         = (piece / digit){1,8}    ; digits and pieces must sum to exactly 8
piece        = "K" / "Q" / "R" / "B" / "N" / "P"
             / "k" / "q" / "r" / "b" / "n" / "p"
digit        = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8"
color        = "w" / "b"
castling     = "-" / 1*("K" / "Q" / "k" / "q")   ; order must be KQkq
en-passant   = "-" / file ("3" / "6")
file         = "a" / "b" / "c" / "d" / "e" / "f" / "g" / "h"
halfmove     = 1*DIGIT                             ; non-negative integer
fullmove     = 1*DIGIT                             ; positive integer (>= 1)
```

## Position Validity Warnings

The parser accepts these positions (does not return `null`) but emits warnings
via the `onWarning` callback in `ParseOptions`:

| Warning           | Condition                                       |
| ----------------- | ----------------------------------------------- |
| Missing king      | Either side has no king on the board            |
| Pawn on back rank | A pawn occupies rank 1 or rank 8                |
| Too many pawns    | Either side has more than 8 pawns               |
| Too many pieces   | Either side has more than 16 pieces (all types) |

These conditions are legal according to the FEN grammar but represent positions
that cannot arise in a legal game.
