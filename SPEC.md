# Specification: Forsyth-Edwards Notation (FEN)

Implements FEN as defined in the
[PGN Standard §16.1](http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c16.1)
and documented on the
[Chess Programming Wiki](https://www.chessprogramming.org/Forsyth-Edwards_Notation).

---

## Format

A FEN string consists of exactly 6 space-separated fields:

```
<placement> <turn> <castling> <en_passant> <halfmove> <fullmove>
```

---

## Field 1: Piece Placement

Ranks from rank 8 (top) to rank 1 (bottom), separated by `/`.
Each rank is described left-to-right (file a to h).

| Character | Meaning |
|-----------|---------|
| `P` `N` `B` `R` `Q` `K` | White piece (pawn, knight, bishop, rook, queen, king) |
| `p` `n` `b` `r` `q` `k` | Black piece |
| `1`–`8` | Number of consecutive empty squares |

Example: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR`

---

## Field 2: Active Color

`w` = white to move, `b` = black to move.

---

## Field 3: Castling Rights

`K` = white kingside, `Q` = white queenside, `k` = black kingside, `q` = black queenside.
`-` = no castling rights.

---

## Field 4: En Passant Target Square

The square behind a pawn that just made a double push (e.g. `e3` after white plays e4),
or `-` if no en passant is possible.

---

## Field 5: Halfmove Clock

Number of halfmoves since the last capture or pawn move. Used for the 50-move rule.

---

## Field 6: Fullmove Number

Starts at 1 and increments after black's move.

---

## Starting Position

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

---

## Implementation Notes

- `parse(input, options?)` — default export, never throws, returns `Position | null`
- `stringify(position)` — always succeeds, deterministic output (castling in `KQkq` order)
- BOM (`\uFEFF`) stripped automatically
- Depends on `@echecs/position` for the `Position` type

## Sources

- [PGN Standard §16.1](http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c16.1)
- [Chess Programming Wiki — FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation)
