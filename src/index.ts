import type {
  CastlingRights,
  Color,
  EnPassantSquare,
  File,
  Piece,
  PieceType,
  Position,
  Rank,
  Square,
} from './types.js';

interface ParseError {
  column: number;
  line: number;
  message: string;
  offset: number;
}

interface ParseWarning {
  column: number;
  line: number;
  message: string;
  offset: number;
}

interface ParseOptions {
  onError?: (error: ParseError) => void;
  onWarning?: (warning: ParseWarning) => void;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const FILES: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS: Rank[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

const CHAR_TO_PIECE_TYPE: Record<string, PieceType> = {
  b: 'bishop',
  k: 'king',
  n: 'knight',
  p: 'pawn',
  q: 'queen',
  r: 'rook',
};

const PIECE_TYPE_TO_CHAR: Record<PieceType, string> = {
  bishop: 'b',
  king: 'k',
  knight: 'n',
  pawn: 'p',
  queen: 'q',
  rook: 'r',
};

function makeError(message: string, offset = 0): ParseError {
  return { column: offset + 1, line: 1, message, offset };
}

function makeWarning(message: string, offset = 0): ParseWarning {
  return { column: offset + 1, line: 1, message, offset };
}

function parsePlacement(
  placement: string,
  onError?: (error: ParseError) => void,
): Map<Square, Piece> | null {
  const board = new Map<Square, Piece>();
  const ranks = placement.split('/');

  if (ranks.length !== 8) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  for (const [rankIndex, rankString] of ranks.entries()) {
    const rank = RANKS[rankIndex];
    if (rank === undefined || rankString === undefined) {
      // eslint-disable-next-line unicorn/no-null
      return null;
    }

    let fileIndex = 0;
    for (const char of rankString) {
      const emptyCount = Number.parseInt(char, 10);
      if (Number.isNaN(emptyCount)) {
        const lower = char.toLowerCase();
        const type = CHAR_TO_PIECE_TYPE[lower];
        if (type === undefined) {
          onError?.(makeError(`Invalid piece type: "${char}"`));
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
        const color: Color = char === char.toUpperCase() ? 'white' : 'black';
        const file = FILES[fileIndex];
        if (file === undefined) {
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
        board.set(`${file}${rank}` as Square, { color, type });
        fileIndex += 1;
      } else {
        fileIndex += emptyCount;
      }
    }

    if (fileIndex !== 8) {
      onError?.(
        makeError(
          `Invalid FEN rank "${rankString}": expected 8 files, got ${fileIndex}`,
        ),
      );
      // eslint-disable-next-line unicorn/no-null
      return null;
    }
  }

  return board;
}

const CASTLING_PATTERN = /^(?:-|K?Q?k?q?)$/;
const EN_PASSANT_PATTERN = /^[a-h][36]$/;

function parseCastling(castling: string): CastlingRights | null {
  if (!CASTLING_PATTERN.test(castling) || castling.length === 0) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  return {
    black: {
      king: castling.includes('k'),
      queen: castling.includes('q'),
    },
    white: {
      king: castling.includes('K'),
      queen: castling.includes('Q'),
    },
  };
}

function stringifyPlacement(board: ReadonlyMap<Square, Piece>): string {
  const rankStrings: string[] = [];

  for (const rank of RANKS) {
    let rankString = '';
    let emptyCount = 0;

    for (const file of FILES) {
      const p = board.get(`${file}${rank}` as Square);
      if (p === undefined) {
        emptyCount += 1;
      } else {
        if (emptyCount > 0) {
          rankString += String(emptyCount);
          emptyCount = 0;
        }
        const char = PIECE_TYPE_TO_CHAR[p.type];
        rankString += p.color === 'white' ? char.toUpperCase() : char;
      }
    }

    if (emptyCount > 0) {
      rankString += String(emptyCount);
    }
    rankStrings.push(rankString);
  }

  return rankStrings.join('/');
}

function stringifyCastling(rights: CastlingRights): string {
  let result = '';
  if (rights.white.king) {
    result += 'K';
  }
  if (rights.white.queen) {
    result += 'Q';
  }
  if (rights.black.king) {
    result += 'k';
  }
  if (rights.black.queen) {
    result += 'q';
  }
  return result.length > 0 ? result : '-';
}

function parse(input: string, options?: ParseOptions): Position | null {
  const content = input.replace(/^\uFEFF/, '').trim();

  if (content.length === 0) {
    options?.onError?.(makeError('Input is empty'));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const parts = content.split(' ');
  if (parts.length !== 6) {
    options?.onError?.(makeError(`Expected 6 FEN fields, got ${parts.length}`));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const [
    placement,
    turnString,
    castlingString,
    epString,
    halfString,
    fullString,
  ] = parts as [string, string, string, string, string, string];

  // Compute the start offset of each field within the content string.
  // Fields are separated by single spaces.
  const fieldOffsets: number[] = [0];
  for (let index = 0; index < parts.length - 1; index++) {
    const previous = fieldOffsets[index] ?? 0;
    const field = parts[index] ?? '';
    fieldOffsets.push(previous + field.length + 1);
  }

  const board = parsePlacement(placement, options?.onError);
  if (board === null) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  if (turnString !== 'w' && turnString !== 'b') {
    options?.onError?.(
      makeError(`Invalid active color: "${turnString}"`, fieldOffsets[1]),
    );
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const turn: Color = turnString === 'w' ? 'white' : 'black';

  const castlingRights = parseCastling(castlingString);
  if (castlingRights === null) {
    options?.onError?.(
      makeError(
        `Invalid castling availability: "${castlingString}"`,
        fieldOffsets[2],
      ),
    );
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  if (epString !== '-' && !EN_PASSANT_PATTERN.test(epString)) {
    options?.onError?.(
      makeError(`Invalid en passant square: "${epString}"`, fieldOffsets[3]),
    );
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const enPassantSquare: EnPassantSquare | undefined =
    epString === '-' ? undefined : (epString as EnPassantSquare);

  const halfmoveClock = Number.parseInt(halfString, 10);
  if (Number.isNaN(halfmoveClock) || halfmoveClock < 0) {
    options?.onError?.(
      makeError(`Invalid halfmove clock: "${halfString}"`, fieldOffsets[4]),
    );
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const fullmoveNumber = Number.parseInt(fullString, 10);
  if (Number.isNaN(fullmoveNumber) || fullmoveNumber < 1) {
    options?.onError?.(
      makeError(`Invalid fullmove number: "${fullString}"`, fieldOffsets[5]),
    );
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  // Position warnings — syntactically valid FEN but suspicious position.
  if (options?.onWarning) {
    let whiteKings = 0;
    let blackKings = 0;
    let whitePawns = 0;
    let blackPawns = 0;
    let whitePieces = 0;
    let blackPieces = 0;
    let pawnOnBackRank = false;

    for (const [square, piece] of board) {
      if (piece.color === 'white') {
        whitePieces += 1;
        if (piece.type === 'king') {
          whiteKings += 1;
        }
        if (piece.type === 'pawn') {
          whitePawns += 1;
          if (square.endsWith('1') || square.endsWith('8')) {
            pawnOnBackRank = true;
          }
        }
      } else {
        blackPieces += 1;
        if (piece.type === 'king') {
          blackKings += 1;
        }
        if (piece.type === 'pawn') {
          blackPawns += 1;
          if (square.endsWith('1') || square.endsWith('8')) {
            pawnOnBackRank = true;
          }
        }
      }
    }

    if (whiteKings === 0) {
      options.onWarning(makeWarning('White king is missing'));
    }
    if (blackKings === 0) {
      options.onWarning(makeWarning('Black king is missing'));
    }
    if (pawnOnBackRank) {
      options.onWarning(makeWarning('Pawn on rank 1 or 8'));
    }
    if (whitePawns > 8) {
      options.onWarning(
        makeWarning(`White has ${whitePawns} pawns (maximum is 8)`),
      );
    }
    if (blackPawns > 8) {
      options.onWarning(
        makeWarning(`Black has ${blackPawns} pawns (maximum is 8)`),
      );
    }
    if (whitePieces > 16) {
      options.onWarning(
        makeWarning(`White has ${whitePieces} pieces (maximum is 16)`),
      );
    }
    if (blackPieces > 16) {
      options.onWarning(
        makeWarning(`Black has ${blackPieces} pieces (maximum is 16)`),
      );
    }
  }

  return {
    board,
    castlingRights,
    enPassantSquare,
    fullmoveNumber,
    halfmoveClock,
    turn,
  };
}

function stringify(position: Position): string {
  const placement = stringifyPlacement(position.board);
  const turn = position.turn === 'white' ? 'w' : 'b';
  const castling = stringifyCastling(position.castlingRights);
  const enPassant = position.enPassantSquare ?? '-';

  return [
    placement,
    turn,
    castling,
    enPassant,
    String(position.halfmoveClock),
    String(position.fullmoveNumber),
  ].join(' ');
}

export type { ParseError, ParseOptions, ParseWarning };
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
} from './types.js';
export { STARTING_FEN, stringify };
export default parse;
