'use strict';

/*
- =========================================================
- MOTOR INTERNO DO TABULEIRO
- =========================================================
 */

const FILES = [
    'a', 'b', 'c', 'd',
    'e', 'f', 'g', 'h'
];

const RANKS = [
    '1', '2', '3', '4',
    '5', '6', '7', '8'
];

const INITIAL_POSITION = {
    a1: 'R',
    b1: 'N',
    c1: 'B',
    d1: 'Q',
    e1: 'K',
    f1: 'B',
    g1: 'N',
    h1: 'R',

    a2: 'P',
    b2: 'P',
    c2: 'P',
    d2: 'P',
    e2: 'P',
    f2: 'P',
    g2: 'P',
    h2: 'P',

    a7: 'p',
    b7: 'p',
    c7: 'p',
    d7: 'p',
    e7: 'p',
    f7: 'p',
    g7: 'p',
    h7: 'p',

    a8: 'r',
    b8: 'n',
    c8: 'b',
    d8: 'q',
    e8: 'k',
    f8: 'b',
    g8: 'n',
    h8: 'r'
};


/* =========================================================
   CRIAÇÃO
   ========================================================= */

function createBoard() {

    return {
        ...INITIAL_POSITION
    };

}


/* =========================================================
   COPIAR
   ========================================================= */

function cloneBoard(board) {

    return {
        ...board
    };

}


/* =========================================================
   COR
   ========================================================= */

function getPieceColor(piece) {

    if (!piece) {
        return null;
    }

    return piece === piece.toUpperCase()
        ? 'white'
        : 'black';

}


/* =========================================================
   TIPO
   ========================================================= */

function getPieceType(piece) {

    if (!piece) {
        return null;
    }

    return piece.toUpperCase();

}


/* =========================================================
   COORDENADAS
   ========================================================= */

function squareToCoordinates(square) {

    if (!/^[a-h][1-8]$/.test(square)) {
        return null;
    }

    return {
        file: square.charCodeAt(0) - 97,
        rank: parseInt(square[1], 10) - 1
    };

}


function coordinatesToSquare(file, rank) {

    if (
        file < 0 ||
        file > 7 ||
        rank < 0 ||
        rank > 7
    ) {
        return null;
    }

    return (
        String.fromCharCode(97 + file) +
        String(rank + 1)
    );

}


/* =========================================================
   DIFERENÇA
   ========================================================= */

function getSquareDifference(from, to) {

    const a = squareToCoordinates(from);
    const b = squareToCoordinates(to);

    if (!a || !b) {
        return null;
    }

    return {
        file: b.file - a.file,
        rank: b.rank - a.rank
    };

}


/* =========================================================
   CAMINHO
   ========================================================= */

function getPathSquares(from, to) {

    const difference =
        getSquareDifference(from, to);

    if (!difference) {
        return [];
    }

    const fromCoords =
        squareToCoordinates(from);

    const fileStep =
        Math.sign(difference.file);

    const rankStep =
        Math.sign(difference.rank);

    const distance =
        Math.max(
            Math.abs(difference.file),
            Math.abs(difference.rank)
        );

    const squares = [];

    for (
        let i = 1;
        i < distance;
        i++
    ) {

        const file =
            fromCoords.file +
            (fileStep * i);

        const rank =
            fromCoords.rank +
            (rankStep * i);

        const square =
            coordinatesToSquare(
                file,
                rank
            );

        if (square) {
            squares.push(square);
        }

    }

    return squares;

}


/* =========================================================
   CAMINHO LIVRE
   ========================================================= */

function isPathClear(
    board,
    from,
    to
) {

    const path =
        getPathSquares(
            from,
            to
        );

    return path.every(
        square => !board[square]
    );

}


/* =========================================================
   MOVIMENTO GEOMÉTRICO
   ========================================================= */

function canPieceMove(
    piece,
    from,
    to
) {

    const type =
        getPieceType(piece);

    const difference =
        getSquareDifference(
            from,
            to
        );

    if (!type || !difference) {
        return false;
    }

    const df =
        Math.abs(difference.file);

    const dr =
        Math.abs(difference.rank);

    switch (type) {

        case 'N':
            return (
                (df === 1 && dr === 2) ||
                (df === 2 && dr === 1)
            );

        case 'B':
            return (
                df === dr &&
                df > 0
            );

        case 'R':
            return (
                (
                    df === 0 &&
                    dr > 0
                ) ||
                (
                    dr === 0 &&
                    df > 0
                )
            );

        case 'Q':
            return (
                (
                    df === dr &&
                    df > 0
                ) ||
                (
                    df === 0 &&
                    dr > 0
                ) ||
                (
                    dr === 0 &&
                    df > 0
                )
            );

        case 'K':
            return (
                df <= 1 &&
                dr <= 1 &&
                (df + dr) > 0
            );

        default:
            return false;

    }

}


/* =========================================================
   PEÃO
   ========================================================= */

function canPawnMove(
    board,
    from,
    to,
    color,
    capture
) {

    const difference =
        getSquareDifference(
            from,
            to
        );

    if (!difference) {
        return false;
    }

    const direction =
        color === 'white'
            ? 1
            : -1;

    if (!capture) {

        if (difference.file !== 0) {
            return false;
        }

        if (
            difference.rank === direction &&
            !board[to]
        ) {
            return true;
        }

        const startRank =
            color === 'white'
                ? 2
                : 7;

        const fromCoords =
            squareToCoordinates(from);

        if (
            fromCoords.rank === startRank - 1 &&
            difference.rank === direction * 2 &&
            !board[to]
        ) {

            const middle =
                coordinatesToSquare(
                    fromCoords.file,
                    fromCoords.rank + direction
                );

            return !board[middle];

        }

        return false;

    }

    return (
        Math.abs(difference.file) === 1 &&
        difference.rank === direction &&
        !!board[to]
    );

}


/* =========================================================
   ENCONTRAR CANDIDATOS
   ========================================================= */

function findCandidatePieces(
    board,
    san,
    color
) {

    const cleanSAN =
        san.replace(
            /[+#]+$/,
            ''
        );

    const promotionMatch =
        cleanSAN.match(
            /=([QRBN])$/
        );

    let movement =
        promotionMatch
            ? cleanSAN.replace(
                /=([QRBN])$/,
                ''
            )
            : cleanSAN;

    const capture =
        movement.includes('x');

    movement =
        movement.replace(
            'x',
            ''
        );

    const destinationMatch =
        movement.match(
            /([a-h][1-8])$/
        );

    if (!destinationMatch) {
        return [];
    }

    const destination =
        destinationMatch[1];

    let pieceType =
        /^[KQRBN]/.test(movement)
            ? movement[0]
            : 'P';

    if (pieceType !== 'P') {

        movement =
            movement.substring(1);

    }

    movement =
        movement.substring(
            0,
            movement.length - 2
        );

    const disambiguation =
        movement;

    const candidates = [];

    for (const square of Object.keys(board)) {

        const piece =
            board[square];

        if (!piece) {
            continue;
        }

        if (
            getPieceColor(piece) !== color
        ) {
            continue;
        }

        if (
            getPieceType(piece) !== pieceType
        ) {
            continue;
        }

        if (
            disambiguation.length > 0 &&
            /^[a-h]$/.test(disambiguation) &&
            square[0] !== disambiguation
        ) {
            continue;
        }

        if (
            disambiguation.length > 0 &&
            /^[1-8]$/.test(disambiguation) &&
            square[1] !== disambiguation
        ) {
            continue;
        }

        let valid;

        if (pieceType === 'P') {

            valid =
                canPawnMove(
                    board,
                    square,
                    destination,
                    color,
                    capture
                );

        } else {

            valid =
                canPieceMove(
                    piece,
                    square,
                    destination
                );

            if (
                valid &&
                ['B', 'R', 'Q'].includes(pieceType)
            ) {

                valid =
                    isPathClear(
                        board,
                        square,
                        destination
                    );

            }

        }

        if (!valid) {
            continue;
        }

        if (capture) {

            if (!board[destination]) {
                continue;
            }

            if (
                getPieceColor(
                    board[destination]
                ) === color
            ) {
                continue;
            }

        } else {

            if (board[destination]) {
                continue;
            }

        }

        candidates.push(square);

    }

    return candidates;

}


/* =========================================================
   NOME DA ORIGEM
   ========================================================= */

function getDescriptiveOriginName(
    board,
    square,
    pieceType
) {

    if (!square) {
        return '';
    }

    const file =
        square[0];

    const rank =
        Number(square[1]);

    if (pieceType === 'N') {

        if (file === 'b') {
            return 'CD';
        }

        if (file === 'g') {
            return 'CR';
        }

        return (
            'C' +
            file.toUpperCase() +
            rank
        );

    }

    if (pieceType === 'R') {

        if (file === 'a') {
            return 'TD';
        }

        if (file === 'h') {
            return 'TR';
        }

        return (
            'T' +
            file.toUpperCase() +
            rank
        );

    }

    if (pieceType === 'B') {

        if (file === 'c') {
            return 'BD';
        }

        if (file === 'f') {
            return 'BR';
        }

        return (
            'B' +
            file.toUpperCase() +
            rank
        );

    }

    return '';

}


/* =========================================================
   APLICAR LANCE
   ========================================================= */

function applyMove(
    board,
    san,
    color
) {

    const previousBoard =
        cloneBoard(board);

    const cleanSAN =
        san.replace(
            /[+#]+$/,
            ''
        );

    if (cleanSAN === 'O-O') {

        if (color === 'white') {

            movePiece(
                board,
                'e1',
                'g1'
            );

            movePiece(
                board,
                'h1',
                'f1'
            );

            return {
                from: 'e1',
                to: 'g1',
                piece: 'K',
                captured: null,
                promotion: null,
                castle: 'king',
                candidates: ['e1'],
                previousBoard
            };

        }

        movePiece(
            board,
            'e8',
            'g8'
        );

        movePiece(
            board,
            'h8',
            'f8'
        );

        return {
            from: 'e8',
            to: 'g8',
            piece: 'k',
            captured: null,
            promotion: null,
            castle: 'king',
            candidates: ['e8'],
            previousBoard
        };

    }

    if (cleanSAN === 'O-O-O') {

        if (color === 'white') {

            movePiece(
                board,
                'e1',
                'c1'
            );

            movePiece(
                board,
                'a1',
                'd1'
            );

            return {
                from: 'e1',
                to: 'c1',
                piece: 'K',
                captured: null,
                promotion: null,
                castle: 'queen',
                candidates: ['e1'],
                previousBoard
            };

        }

        movePiece(
            board,
            'e8',
            'c8'
        );

        movePiece(
            board,
            'a8',
            'd8'
        );

        return {
            from: 'e8',
            to: 'c8',
            piece: 'k',
            captured: null,
            promotion: null,
            castle: 'queen',
            candidates: ['e8'],
            previousBoard
        };

    }

    const candidates =
        findCandidatePieces(
            board,
            san,
            color
        );

    if (candidates.length !== 1) {

        throw new Error(
            `Não foi possível determinar a origem do lance "${san}". Candidatos: ${JSON.stringify(candidates)}`
        );

    }

    const from =
        candidates[0];

    const destinationMatch =
        cleanSAN.match(
            /([a-h][1-8])/
        );

    if (!destinationMatch) {

        throw new Error(
            `Destino inválido no lance "${san}".`
        );

    }

    const to =
        destinationMatch[1];

    const piece =
        board[from];

    const captured =
        board[to] || null;

    const promotionMatch =
        cleanSAN.match(
            /=([QRBN])/
        );

    const promotion =
        promotionMatch
            ? promotionMatch[1]
            : null;

    delete board[from];

    let resultingPiece =
        piece;

    if (promotion) {

        resultingPiece =
            color === 'white'
                ? promotion
                : promotion.toLowerCase();

    }

    board[to] =
        resultingPiece;

    return {
        from,
        to,
        piece,
        captured,
        promotion,
        castle: null,
        candidates,
        previousBoard
    };

}


/* =========================================================
   MOVER
   ========================================================= */

function movePiece(
    board,
    from,
    to
) {

    const piece =
        board[from];

    if (!piece) {
        return;
    }

    delete board[from];

    board[to] =
        piece;

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function buildMoveHistory(
    moves
) {

    const board =
        createBoard();

    const history = [];

    for (const move of moves) {

        const state =
            applyMove(
                board,
                move.san,
                move.color
            );

        history.push({

            ply:
                move.ply,

            number:
                move.number,

            color:
                move.color,

            san:
                move.san,

            from:
                state.from,

            to:
                state.to,

            piece:
                state.piece,

            captured:
                state.captured,

            promotion:
                state.promotion,

            castle:
                state.castle,

            candidates:
                state.candidates,

            boardBefore:
                state.previousBoard,

            boardAfter:
                cloneBoard(board)

        });

    }

    return history;

}


/* =========================================================
   NOVO: RENDERIZAÇÃO E ROTAÇÃO DO TABULEIRO VISUAL (COM SVG)
   ========================================================= */

const UNICODE_PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

/* Mapeamento dos arquivos SVG localizados na pasta 'svg' */
const SVG_PIECES = {
    'K': 'svg/wK.svg', 'Q': 'svg/wQ.svg', 'R': 'svg/wR.svg', 'B': 'svg/wB.svg', 'N': 'svg/wN.svg', 'P': 'svg/wP.svg',
    'k': 'svg/bK.svg', 'q': 'svg/bQ.svg', 'r': 'svg/bR.svg', 'b': 'svg/bB.svg', 'n': 'svg/bN.svg', 'p': 'svg/bP.svg'
};

/**
 * Renderiza o estado atual do tabuleiro no elemento DOM especificado.
 */
function renderBoard(boardState, containerId = 'board', isFlipped = false, highlightMove = null, showCoverage = false) {
    const boardElement = document.getElementById(containerId);
    if (!boardElement) return;

    boardElement.innerHTML = '';

    if (isFlipped) {
        boardElement.classList.add('flipped');
    } else {
        boardElement.classList.remove('flipped');
    }

    const ranks = [...RANKS].reverse(); // '8' até '1'
    const files = [...FILES];           // 'a' até 'h'

    const coverageMap = showCoverage ? calculateCoverage(boardState) : null;

    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const rank = ranks[r];
            const file = files[f];
            const square = `${file}${rank}`;

            const squareElement = document.createElement('div');
            squareElement.classList.add('chess-square');
            
            const isLight = (r + f) % 2 === 0;
            squareElement.classList.add(isLight ? 'light' : 'dark');

            if (highlightMove && (square === highlightMove.from || square === highlightMove.to)) {
                squareElement.classList.add('highlight');
            }

            if (showCoverage && coverageMap && coverageMap[square]) {
                const { white, black } = coverageMap[square];

                if (white > 0) {
                    const whiteBadge = document.createElement('span');
                    whiteBadge.className = 'coverage-badge coverage-white';
                    whiteBadge.textContent = white;
                    squareElement.appendChild(whiteBadge);
                }

                if (black > 0) {
                    const blackBadge = document.createElement('span');
                    blackBadge.className = 'coverage-badge coverage-black';
                    blackBadge.textContent = black;
                    squareElement.appendChild(blackBadge);
                }
            }

            // Adiciona a peça usando SVG se existir na casa
            const piece = boardState[square];
            if (piece && SVG_PIECES[piece]) {
                const pieceElement = document.createElement('img');
                pieceElement.classList.add('chess-piece');
                pieceElement.src = SVG_PIECES[piece];
                pieceElement.alt = piece;
                squareElement.appendChild(pieceElement);
            }

            if (f === 0) {
                const rankSpan = document.createElement('span');
                rankSpan.className = 'coord coord-rank';
                rankSpan.textContent = rank;
                squareElement.appendChild(rankSpan);
            }

            if (r === 7) {
                const fileSpan = document.createElement('span');
                fileSpan.className = 'coord coord-file';
                fileSpan.textContent = file;
                squareElement.appendChild(fileSpan);
            }

            boardElement.appendChild(squareElement);
        }
    }
}

/**
 * Alterna a orientação atual (white <-> black)
 */
function flipBoardOrientation(currentOrientation) {
    return currentOrientation === 'white' ? 'black' : 'white';
}


/* =========================================================
   CÁLCULO DE COBERTURA / RAIO DE AÇÃO MULTI-PEÇA
   ========================================================= */

function calculateCoverage(board) {
    const coverage = {};

    for (const f of FILES) {
        for (const r of RANKS) {
            coverage[`${f}${r}`] = { white: 0, black: 0 };
        }
    }

    for (const square in board) {
        const piece = board[square];
        if (!piece) continue;

        const color = getPieceColor(piece);
        const type = getPieceType(piece);
        const coords = squareToCoordinates(square);
        if (!coords) continue;

        const attackedSquares = getAttackedSquaresByPiece(board, coords, type, color);

        attackedSquares.forEach(targetSquare => {
            if (coverage[targetSquare]) {
                coverage[targetSquare][color]++;
            }
        });
    }

    return coverage;
}

function getAttackedSquaresByPiece(board, coords, type, color) {
    const targets = [];

    const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const diagonalDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const knightOffsets = [
        [1, 2], [1, -2], [-1, 2], [-1, -2],
        [2, 1], [2, -1], [-2, 1], [-2, -1]
    ];

    switch (type) {
        case 'P': {
            const dir = color === 'white' ? 1 : -1;
            const captureFiles = [coords.file - 1, coords.file + 1];
            const targetRank = coords.rank + dir;

            captureFiles.forEach(f => {
                const sq = coordinatesToSquare(f, targetRank);
                if (sq) targets.push(sq);
            });
            break;
        }

        case 'N': {
            knightOffsets.forEach(([df, dr]) => {
                const sq = coordinatesToSquare(coords.file + df, coords.rank + dr);
                if (sq) targets.push(sq);
            });
            break;
        }

        case 'B': {
            addRayAttacks(board, coords, diagonalDirs, targets);
            break;
        }

        case 'R': {
            addRayAttacks(board, coords, straightDirs, targets);
            break;
        }

        case 'Q': {
            addRayAttacks(board, coords, [...straightDirs, ...diagonalDirs], targets);
            break;
        }

        case 'K': {
            [...straightDirs, ...diagonalDirs].forEach(([df, dr]) => {
                const sq = coordinatesToSquare(coords.file + df, coords.rank + dr);
                if (sq) targets.push(sq);
            });
            break;
        }
    }

    return targets;
}

function addRayAttacks(board, startCoords, directions, targets) {
    directions.forEach(([df, dr]) => {
        let f = startCoords.file + df;
        let r = startCoords.rank + dr;

        while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
            const sq = coordinatesToSquare(f, r);
            if (sq) {
                targets.push(sq);
                if (board[sq]) {
                    break;
                }
            }
            f += df;
            r += dr;
        }
    });
}