import { describe, expect, it, vi } from 'vitest';

import { STARTING_FEN, parse, stringify } from '../index.js';

import type { ParseError, ParseWarning } from '../index.js';

const STARTING = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('parse — failure cases', () => {
  it('returns null for empty input', () => {
    expect(parse('')).toBeNull();
  });

  it('calls onError for empty input', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('', { onError });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('reports offset 0 for empty input', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('', { onError });
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      column: 1,
      line: 1,
      offset: 0,
    });
  });

  it('reports offset at the turn field for invalid color', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    // placement(43) + ' '(1) = 44
    parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1', {
      onError,
    });
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      column: 45,
      line: 1,
      offset: 44,
    });
  });

  it('returns null for wrong field count', () => {
    expect(parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')).toBeNull();
  });

  it('strips BOM', () => {
    expect(parse('\uFEFF' + STARTING)).not.toBeNull();
  });
});

describe('parse — starting position', () => {
  it('parses 32 pieces', () => {
    expect(parse(STARTING)?.board.size).toBe(32);
  });

  it('parses white to move', () => {
    expect(parse(STARTING)?.turn).toBe('white');
  });

  it('parses all castling rights', () => {
    expect(parse(STARTING)?.castlingRights).toEqual({
      black: { king: true, queen: true },
      white: { king: true, queen: true },
    });
  });

  it('parses no en passant square', () => {
    expect(parse(STARTING)?.enPassantSquare).toBeUndefined();
  });

  it('parses halfmove clock 0', () => {
    expect(parse(STARTING)?.halfmoveClock).toBe(0);
  });

  it('parses fullmove number 1', () => {
    expect(parse(STARTING)?.fullmoveNumber).toBe(1);
  });

  it('parses white king on e1', () => {
    expect(parse(STARTING)?.board.get('e1')).toEqual({
      color: 'white',
      type: 'king',
    });
  });

  it('parses black queen on d8', () => {
    expect(parse(STARTING)?.board.get('d8')).toEqual({
      color: 'black',
      type: 'queen',
    });
  });
});

describe('parse — after e4', () => {
  const FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

  it('parses black to move', () => {
    expect(parse(FEN)?.turn).toBe('black');
  });

  it('parses en passant square e3', () => {
    expect(parse(FEN)?.enPassantSquare).toBe('e3');
  });

  it('parses white pawn on e4', () => {
    expect(parse(FEN)?.board.get('e4')).toEqual({
      color: 'white',
      type: 'pawn',
    });
  });

  it('parses empty e2', () => {
    expect(parse(FEN)?.board.get('e2')).toBeUndefined();
  });
});

describe('parse — invalid piece type', () => {
  it('returns null for invalid piece letter', () => {
    // 'x' is not a valid piece type
    expect(
      parse('xnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    ).toBeNull();
  });

  it('calls onError for invalid piece letter', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('xnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('reports offset at the placement field', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('xnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
      onError,
    });
    // Placement is field 0, starts at offset 0
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      column: 1,
      line: 1,
      offset: 0,
    });
  });
});

describe('parse — invalid castling string', () => {
  it('returns null for invalid castling characters', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1'),
    ).toBeNull();
  });

  it('returns null for castling in wrong order', () => {
    // Spec says: uppercase before lowercase, kingside before queenside
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w qK - 0 1'),
    ).toBeNull();
  });

  it('calls onError for invalid castling string', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1', {
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('reports offset at the castling field', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    // 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1'
    //  0                                            44 46
    // placement(43) + ' '(1) + turn(1) + ' '(1) = 46
    parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1', {
      onError,
    });
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      column: 47,
      line: 1,
      offset: 46,
    });
  });
});

describe('parse — invalid en passant square', () => {
  it('returns null for invalid file in en passant', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq x3 0 1'),
    ).toBeNull();
  });

  it('returns null for invalid rank in en passant', () => {
    // En passant square can only be rank 3 or 6
    expect(
      parse('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e4 0 1'),
    ).toBeNull();
  });

  it('calls onError for invalid en passant square', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq z9 0 1', {
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('reports offset at the en passant field', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    // 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq z9 0 1'
    //  placement(45) + ' '(1) + turn(1) + ' '(1) + castling(4) + ' '(1) = 53
    parse('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq z9 0 1', {
      onError,
    });
    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      column: 54,
      line: 1,
      offset: 53,
    });
  });
});

describe('parse — rank mismatch', () => {
  it('returns null for underfilled rank', () => {
    // 'rnbqkbn' is only 7 pieces, no empty squares digit
    expect(
      parse('rnbqkbn/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    ).toBeNull();
  });

  it('calls onError exactly once for rank mismatch', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    const onWarning = vi.fn();
    parse('rnbqkbn/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
      onError,
      onWarning,
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(onWarning).not.toHaveBeenCalled();
  });
});

describe('parse — invalid halfmove clock', () => {
  it('returns null for non-numeric halfmove clock', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - abc 1'),
    ).toBeNull();
  });

  it('returns null for negative halfmove clock', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1'),
    ).toBeNull();
  });

  it('calls onError for invalid halfmove clock', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - abc 1', {
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
  });
});

describe('parse — invalid fullmove number', () => {
  it('returns null for non-numeric fullmove number', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 abc'),
    ).toBeNull();
  });

  it('returns null for fullmove number 0', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0'),
    ).toBeNull();
  });

  it('returns null for negative fullmove number', () => {
    expect(
      parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 -5'),
    ).toBeNull();
  });

  it('calls onError for invalid fullmove number', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 abc', {
      onError,
    });
    expect(onError).toHaveBeenCalledOnce();
  });
});

describe('parse — castling variants', () => {
  it('parses no castling rights', () => {
    expect(parse('4k3/8/8/8/8/8/8/4K3 w - - 0 1')?.castlingRights).toEqual({
      black: { king: false, queen: false },
      white: { king: false, queen: false },
    });
  });

  it('parses partial castling rights', () => {
    expect(parse('4k3/8/8/8/8/8/8/4K3 w Kq - 0 1')?.castlingRights).toEqual({
      black: { king: false, queen: true },
      white: { king: true, queen: false },
    });
  });
});

describe('parse — position warnings', () => {
  it('warns when white king is missing', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    // No white king, only black king
    const result = parse('4k3/8/8/8/8/8/8/8 w - - 0 1', { onWarning });
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('warns when black king is missing', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    // No black king, only white king
    const result = parse('8/8/8/8/8/8/8/4K3 w - - 0 1', { onWarning });
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('warns when a pawn is on rank 1', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    const result = parse('4k3/8/8/8/8/8/8/P3K3 w - - 0 1', { onWarning });
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('warns when a pawn is on rank 8', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    const result = parse('p3k3/8/8/8/8/8/8/4K3 w - - 0 1', { onWarning });
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('warns when a side has more than 8 pawns', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    // 9 white pawns
    const result = parse('4k3/8/8/8/PPPPPPPP/P7/8/4K3 w - - 0 1', {
      onWarning,
    });
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('warns when a side has more than 16 pieces', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    // 17 white pieces (impossible but syntactically valid)
    const result = parse(
      '4k3/8/8/8/NNNNNNNN/NNNNNNNN/PPPPPPPP/RNBQKBNR w - - 0 1',
      { onWarning },
    );
    expect(result).not.toBeNull();
    expect(onWarning).toHaveBeenCalled();
  });

  it('does not warn for valid starting position', () => {
    const onWarning = vi.fn<(warning: ParseWarning) => void>();
    parse(STARTING, { onWarning });
    expect(onWarning).not.toHaveBeenCalled();
  });
});

describe('stringify', () => {
  it('round-trips starting position', () => {
    expect(stringify(parse(STARTING)!)).toBe(STARTING);
  });

  it('round-trips position with en passant', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(stringify(parse(fen)!)).toBe(fen);
  });

  it('round-trips position with no castling', () => {
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(stringify(parse(fen)!)).toBe(fen);
  });
});

describe('STARTING_FEN', () => {
  it('equals the standard starting position FEN', () => {
    expect(STARTING_FEN).toBe(STARTING);
  });
});
