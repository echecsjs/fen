type Color = 'black' | 'white';

type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

type PieceType = 'bishop' | 'king' | 'knight' | 'pawn' | 'queen' | 'rook';

type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

type Square = `${File}${Rank}`;

type EnPassantSquare = `${File}${'3' | '6'}`;

interface SideCastlingRights {
  king: boolean;
  queen: boolean;
}

interface CastlingRights {
  black: SideCastlingRights;
  white: SideCastlingRights;
}

interface Piece {
  color: Color;
  type: PieceType;
}

interface Position {
  board: ReadonlyMap<Square, Piece>;
  castlingRights: CastlingRights;
  enPassantSquare: EnPassantSquare | undefined;
  fullmoveNumber: number;
  halfmoveClock: number;
  turn: Color;
}

export type {
  CastlingRights,
  Color,
  EnPassantSquare,
  File,
  Piece,
  PieceType,
  Position,
  Rank,
  SideCastlingRights,
  Square,
};
