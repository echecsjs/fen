# Changelog

## [2.0.0] - 2026-04-09

### Changed

- `Color` type from `'w' | 'b'` to `'white' | 'black'`.
- `PieceType` type from single-char (`'p'`, `'n'`, `'b'`, `'r'`, `'q'`, `'k'`)
  to full names (`'pawn'`, `'knight'`, `'bishop'`, `'rook'`, `'queen'`,
  `'king'`).
- `CastlingRights` from flat `{ wK, wQ, bK, bQ }` to nested
  `{ white: { king, queen }, black: { king, queen } }`.
- `Position.board` from `Map` to `ReadonlyMap`.
- En passant square type narrowed from `Square` to `` `${File}${'3' | '6'}` ``.

### Added

- `EnPassantSquare` and `SideCastlingRights` type exports.

### Fixed

- ESLint config ordering (`eslint-config-prettier` moved to end of array).

## [1.0.1] - 2026-03-19

### Fixed

- Updated lockfile after removing `@echecs/position` dependency.

## [1.0.0] - 2026-03-19

### Added

- FEN syntax validation for halfmove clock (>= 0) and fullmove number (>= 1).
- Position warnings via `onWarning`: missing king, pawns on rank 1 or 8, more
  than 8 pawns per side, more than 16 pieces per side.
- Accurate `offset`, `line`, and `column` fields on `ParseError` and
  `ParseWarning`.
- Exported all core types: `CastlingRights`, `Color`, `File`, `Piece`,
  `PieceType`, `Position`, `Rank`, `Square`.

### Changed

- Invalid halfmove clock and fullmove number are now hard errors (previously
  warnings with fallback defaults).
- Rank mismatch in placement fires `onError` exactly once (previously fired both
  `onWarning` and `onError`).
- Removed `@echecs/position` runtime dependency; all types are defined locally.
- Package is ESM-only; removed `"main"` field from `package.json`.

## [0.1.0] - 2026-03-19

### Added

- `parse` default export: FEN string to `Position` object (returns `null` on
  invalid input).
- `stringify` named export: `Position` object to FEN string.
- `STARTING_FEN` constant for the standard starting position.
- FEN syntax validation for piece types, castling availability, and en passant
  target square.
- `onError` and `onWarning` callbacks via `ParseOptions`.
