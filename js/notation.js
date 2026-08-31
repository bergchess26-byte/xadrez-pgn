'use strict';

/*
 * =========================================================
 * SISTEMAS DE NOTAÇÃO
 * =========================================================
 *
 * 1. Algébrica
 * 2. Algébrica PT
 * 3. Descritiva
 */


/* =========================================================
   ALGÉBRICA
   ========================================================= */

function notationAlgebraic(move) {
    return move?.san || '';
}


/* =========================================================
   ALGÉBRICA PT
   ========================================================= */

const PIECE_PT = {
    K: 'R',
    Q: 'D',
    R: 'T',
    B: 'B',
    N: 'C',
    P: ''
};


function notationAlgebraicPT(move) {
    let san = move?.san || '';

    if (!san) {
        return '';
    }

    /*
     * Roque.
     */
    if (/^O-O(-O)?[+#]?$/.test(san)) {
        return san;
    }

    const piece = (move.piece || 'P').toUpperCase();
    const prefix = PIECE_PT[piece] ?? '';

    /*
     * Remove a letra inglesa da peça.
     */
    if (piece !== 'P' && /^[KQRBN]/.test(san)) {
        san = san.substring(1);
    }

    return prefix + san;
}


/* =========================================================
   DESCRITIVA
   ========================================================= */

/*
 * CONVENÇÃO ADOTADA
 *
 * Movimento normal:
 *     P4R
 *     C3BR
 *     T1CR
 *
 * Captura:
 *     PxC
 *     TxC
 *     DxB
 *
 * O destino NÃO aparece na captura, a menos que seja necessário
 * para desambiguação. Indica-se a peça capturada.
 *
 * Xeque / Mate:
 *     + / ++
 */


/* =========================================================
   NOMENCLATURA DAS COLUNAS E PEÇAS
   ========================================================= */

const DESCRIPTIVE_FILES = {
    a: 'TD',
    b: 'CD',
    c: 'BD',
    d: 'D',
    e: 'R',
    f: 'BR',
    g: 'CR',
    h: 'TR'
};

const DESCRIPTIVE_PIECES = {
    K: 'R',
    Q: 'D',
    R: 'T',
    B: 'B',
    N: 'C',
    P: 'P'
};


/* =========================================================
   FUNÇÕES AUXILIARES DE COORDENADAS DESCRITIVAS
   ========================================================= */

function descriptiveFile(file) {
    return DESCRIPTIVE_FILES[file] || '';
}

function descriptiveRank(rank, color) {
    const numeric = Number(rank);

    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 8) {
        return '';
    }

    /*
     * Brancas: 1→1, 8→8
     * Pretas:  8→1, 1→8
     */
    if (color === 'white') {
        return String(numeric);
    }

    return String(9 - numeric);
}

function squareToDescriptive(square, color) {
    if (!square || !/^[a-h][1-8]$/.test(square)) {
        return '';
    }

    const file = square.charAt(0);
    const rank = square.charAt(1);

    return (
        descriptiveFile(file) +
        descriptiveRank(rank, color)
    );
}

/*
 * Converte a casa (ex: e4 para brancas) em notação invertida
 * para leitura tradicional descritiva (ex: 4R em vez de R4).
 */
function formatDescriptiveSquare(square, color) {
    const raw = squareToDescriptive(square, color);
    const match = raw.match(/^([A-Z]+)(\d+)$/);

    if (!match) {
        return raw;
    }

    return match[2] + match[1];
}

function descriptivePiece(piece) {
    return DESCRIPTIVE_PIECES[(piece || 'P').toUpperCase()] || '';
}


/* =========================================================
   XEQUE / MATE
   ========================================================= */

function getDescriptiveCheckSuffix(san) {
    if (!san) {
        return '';
    }

    if (san.includes('#') || san.includes('++')) {
        return '++';
    }

    if (san.includes('+')) {
        return '+';
    }

    return '';
}


/* =========================================================
   CAPTURA E PEÇA CAPTURADA
   ========================================================= */

function isCapture(move) {
    if (move.captured !== undefined && move.captured !== null) {
        return true;
    }

    const san = move.san || '';
    return san.includes('x');
}

function descriptiveCapturedPiece(move) {
    if (move.captured !== undefined && move.captured !== null) {
        return descriptivePiece(move.captured);
    }

    return 'P';
}


/* =========================================================
   ROQUE
   ========================================================= */

function descriptiveCastle(move) {
    const san = move?.san || '';

    if (move.castle === 'queen' || /^O-O-O/.test(san)) {
        return 'O-O-O' + getDescriptiveCheckSuffix(san);
    }

    if (move.castle === 'king' || /^O-O/.test(san)) {
        return 'O-O' + getDescriptiveCheckSuffix(san);
    }

    return null;
}


/* =========================================================
   DESAMBIGUAÇÃO DA PEÇA QUE SE MOVE
   ========================================================= */

function getMovingPieceName(move) {
    const pieceType = (move.piece || 'P').toUpperCase();
    const basePiece = descriptivePiece(pieceType);

    if (pieceType === 'P') {
        return 'P';
    }

    /*
     * Verifica se a SAN traz informação de coluna/fileira de origem
     * (exemplo: Nbd2 -> b, R1e1 -> 1)
     */
    const san = move.san || '';
    const match = san.match(/^[KQRBN]([a-h1-8])x?[a-h][1-8]/);

    if (match && move.from) {
        const originFile = move.from.charAt(0);
        // Se a origem é nas colunas a-d, é do lado da Dama (D); se e-h, lado do Rei (R)
        const side = ['a', 'b', 'c', 'd'].includes(originFile) ? 'D' : 'R';
        return basePiece + side;
    }

    return basePiece;
}


/* =========================================================
   PEÃO
   ========================================================= */

function notationDescriptivePawn(move) {
    const capture = isCapture(move);
    const color = move.color || 'white';

    /*
     * Captura de peão: PxC, PxP, etc.
     */
    if (capture) {
        const captured = descriptiveCapturedPiece(move);

        // Se o SAN indicar desambiguação de peão (ex: axb4 -> P(TD)xP)
        const san = move.san || '';
        if (/^[a-h]x/.test(san) && move.from) {
            const file = descriptiveFile(move.from.charAt(0));
            return 'P(' + file + ')x' + captured;
        }

        return 'Px' + captured;
    }

    /*
     * Movimento normal: P4R, P3BD, etc.
     */
    const destination = formatDescriptiveSquare(move.to, color);
    if (!destination) {
        return '';
    }

    return 'P' + destination;
}


/* =========================================================
   PEÇAS (DEMAIS PEÇAS FORA PEÃO)
   ========================================================= */

function notationDescriptivePiece(move) {
    const color = move.color || 'white';
    const capture = isCapture(move);
    const movingPiece = getMovingPieceName(move);

    /*
     * Captura: CxP, DxB, CDxP
     */
    if (capture) {
        const captured = descriptiveCapturedPiece(move);
        return movingPiece + 'x' + captured;
    }

    /*
     * Movimento Normal: C3BD, T1CR, D5R
     */
    const destination = formatDescriptiveSquare(move.to, color);
    return movingPiece + destination;
}


/* =========================================================
   PROMOÇÃO
   ========================================================= */

function descriptivePromotion(move) {
    if (!move.promotion) {
        return '';
    }

    return '=' + descriptivePiece(move.promotion);
}


/* =========================================================
   DESCRITIVA PRINCIPAL
   ========================================================= */

function notationDescriptive(move) {
    if (!move) {
        return '';
    }

    /*
     * 1. Roque
     */
    const castle = descriptiveCastle(move);
    if (castle !== null) {
        return castle;
    }

    const piece = (move.piece || 'P').toUpperCase();
    let notation = '';

    /*
     * 2. Peão ou Demais Peças
     */
    if (piece === 'P') {
        notation = notationDescriptivePawn(move);
    } else {
        notation = notationDescriptivePiece(move);
    }

    /*
     * 3. Promoção
     */
    notation += descriptivePromotion(move);

    /*
     * 4. Xeque / Mate
     */
    notation += getDescriptiveCheckSuffix(move.san);

    return notation;
}


/* =========================================================
   CONVERSOR GERAL
   ========================================================= */

function convertMove(move) {
    if (!move) {
        return '';
    }

    const notation =
        typeof currentGame !== 'undefined' && currentGame?.notation
            ? currentGame.notation
            : typeof preferredNotation !== 'undefined'
            ? preferredNotation
            : 'algebraic';

    switch (notation) {
        case 'algebraic-pt':
            return notationAlgebraicPT(move);

        case 'descriptive':
            return notationDescriptive(move);

        case 'algebraic':
        default:
            return notationAlgebraic(move);
    }
}