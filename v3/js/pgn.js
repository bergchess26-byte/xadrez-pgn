'use strict';

/*
 * =========================================================
 * PGN PARSER
 * =========================================================
 *
 * Este arquivo:
 *
 * 1. Lê os cabeçalhos do PGN.
 * 2. Remove comentários.
 * 3. Remove variantes.
 * 4. Remove NAGs.
 * 5. Identifica o resultado.
 * 6. Extrai os movimentos.
 *
 * A estrutura foi preparada para posteriormente
 * trabalharmos com a posição do tabuleiro e conversão
 * para:
 *
 * - Algébrica
 * - Algébrica PT
 * - Descritiva
 */


/* =========================================================
   CONSTANTES
   ========================================================= */

const PGN_RESULTS = new Set([
    '1-0',
    '0-1',
    '1/2-1/2',
    '*'
]);


/* =========================================================
   PARSER PRINCIPAL
   ========================================================= */

function parsePGN(pgnText) {

    if (
        typeof pgnText !== 'string' ||
        !pgnText.trim()
    ) {
        throw new Error(
            'O conteúdo PGN está vazio.'
        );
    }


    /*
     * Normaliza quebras de linha.
     */

    let text =
        pgnText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .trim();


    /*
     * Cabeçalhos.
     */

    const headers =
        parseHeaders(text);


    /*
     * Corpo da partida.
     */

    let movesText =
        removeHeaders(text);


    /*
     * Comentários.
     */

    movesText =
        removeComments(movesText);


    /*
     * Variantes.
     *
     * É importante fazer isso depois dos comentários.
     */

    movesText =
        removeVariations(movesText);


    /*
     * NAGs.
     */

    movesText =
        removeNAGs(movesText);


    /*
     * Extrai movimentos.
     */

    const moves =
        parseMoves(movesText);


    if (moves.length === 0) {

        throw new Error(
            'Nenhum lance válido foi encontrado no PGN.'
        );
    }


    /*
     * Resultado.
     *
     * Preferimos o resultado do cabeçalho.
     */

    const result =
        headers.Result ||
        extractResult(movesText) ||
        '*';


    return {

        headers,

        moves,

        result

    };
}


/* =========================================================
   CABEÇALHOS
   ========================================================= */

function parseHeaders(pgnText) {

    const headers = {};

    /*
     * PGN utiliza:
     *
     * [Tag "Value"]
     *
     * Permitimos espaços extras.
     */

    const regex =
        /^\s*\[\s*([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\s*\]\s*$/gm;

    let match;

    while (
        (match = regex.exec(pgnText)) !== null
    ) {

        const key =
            match[1];

        let value =
            match[2];


        /*
         * Escapes definidos pelo PGN.
         */

        value =
            value
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');


        headers[key] = value;
    }

    return headers;
}


/* =========================================================
   REMOVER CABEÇALHOS
   ========================================================= */

function removeHeaders(pgnText) {

    return pgnText.replace(
        /^\s*\[\s*[A-Za-z0-9_]+\s+"(?:\\.|[^"]*)"\s*\]\s*$/gm,
        ''
    );
}


/* =========================================================
   COMENTÁRIOS
   ========================================================= */

function removeComments(text) {

    /*
     * Comentários entre chaves:
     *
     * {Este é um comentário}
     */

    text =
        text.replace(
            /\{[\s\S]*?\}/g,
            ' '
        );


    /*
     * Comentários iniciados por ponto e vírgula:
     *
     * ; comentário
     */

    text =
        text.replace(
            /;[^\n]*/g,
            ' '
        );


    return text;
}


/* =========================================================
   VARIANTES
   ========================================================= */

function removeVariations(text) {

    let result =
        text;

    let previous;


    /*
     * Remove o conteúdo de parênteses.
     *
     * Repetimos porque podem existir variantes
     * aninhadas.
     */

    do {

        previous =
            result;

        result =
            result.replace(
                /\([^()]*\)/g,
                ' '
            );

    } while (
        result !== previous
    );


    /*
     * Se ainda houver parênteses desequilibrados,
     * não tentamos interpretar o conteúdo restante
     * como lance.
     */

    return result;
}


/* =========================================================
   NAGS
   ========================================================= */

function removeNAGs(text) {

    /*
     * NAGs:
     *
     * $1
     * $2
     * $3
     * ...
     */

    return text.replace(
        /\$\d+/g,
        ' '
    );
}


/* =========================================================
   RESULTADO
   ========================================================= */

function extractResult(text) {

    /*
     * Procura o resultado normalmente no final
     * da sequência de movimentos.
     */

    const matches =
        text.match(
            /(?:^|\s)(1-0|0-1|1\/2-1\/2|\*)(?=\s*$)/m
        );

    return matches
        ? matches[1]
        : null;
}


/* =========================================================
   MOVIMENTOS
   ========================================================= */

function parseMoves(text) {

    /*
     * Tokenização baseada em espaço.
     */

    const tokens =
        text
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    const moves = [];

    let moveNumber = 1;

    let color = 'white';


    for (const originalToken of tokens) {

        let token =
            originalToken.trim();


        if (!token) {
            continue;
        }


        /*
         * Resultado da partida.
         */

        if (
            PGN_RESULTS.has(token)
        ) {
            continue;
        }


        /*
         * NAG.
         */

        if (
            /^\$\d+$/.test(token)
        ) {
            continue;
        }


        /*
         * Alguns PGNs apresentam números
         * separados dos lances.
         *
         * Exemplos:
         *
         * 1.
         * 1...
         * 2.
         */

        if (
            /^\d+\.$/.test(token)
        ) {

            const number =
                parseInt(
                    token,
                    10
                );

            if (
                Number.isInteger(number)
            ) {
                moveNumber =
                    number;
            }

            color =
                'white';

            continue;
        }


        /*
         * Formato:
         *
         * 1...
         */

        if (
            /^\d+\.\.\.$/.test(token)
        ) {

            const number =
                parseInt(
                    token.replace(/\.\.\.$/, ''),
                    10
                );

            if (
                Number.isInteger(number)
            ) {
                moveNumber =
                    number;
            }

            color =
                'black';

            continue;
        }


        /*
         * Formato:
         *
         * 1.e4
         * 1...e5
         *
         * Alguns geradores de PGN fazem isso.
         */

        const compactMatch =
            token.match(
                /^(\d+)\.(\.\.)?(.*)$/
            );


        if (compactMatch) {

            moveNumber =
                parseInt(
                    compactMatch[1],
                    10
                );

            color =
                compactMatch[2]
                    ? 'black'
                    : 'white';

            token =
                compactMatch[3];

            if (!token) {
                continue;
            }
        }


        /*
         * Remove anotações simples:
         *
         * e4!
         * e4?
         * e4?!
         */

        const san =
            cleanMove(token);


        /*
         * Validação básica do SAN.
         */

        if (
            !isPotentialSAN(san)
        ) {
            continue;
        }


        moves.push({

            ply:
                moves.length + 1,

            number:
                moveNumber,

            color,

            san

        });


        /*
         * Alterna o jogador.
         */

        if (
            color === 'white'
        ) {

            color =
                'black';

        } else {

            color =
                'white';

            moveNumber++;
        }
    }


    return moves;
}


/* =========================================================
   LIMPEZA DO LANCE
   ========================================================= */

function cleanMove(move) {

    let result =
        move.trim();


    /*
     * Remove NAGs que estejam anexados.
     */

    result =
        result.replace(
            /\$\d+/g,
            ''
        );


    /*
     * Remove símbolos de anotação:
     *
     * !
     * ?
     * !?
     * ?!
     * !!
     * ??
     *
     * O + e # NÃO são removidos,
     * pois fazem parte do SAN.
     */

    result =
        result.replace(
            /[!?]+$/g,
            ''
        );


    /*
     * Normaliza zero-zero.
     *
     * Alguns PGNs usam 0-0.
     */

    if (
        result === '0-0'
    ) {
        result = 'O-O';
    }

    if (
        result === '0-0-0'
    ) {
        result = 'O-O-O';
    }


    return result;
}


/* =========================================================
   VALIDAÇÃO BÁSICA SAN
   ========================================================= */

function isPotentialSAN(move) {

    if (!move) {
        return false;
    }


    /*
     * Roque.
     */

    if (
        move === 'O-O' ||
        move === 'O-O+' ||
        move === 'O-O#' ||
        move === 'O-O-O' ||
        move === 'O-O-O+' ||
        move === 'O-O-O#'
    ) {
        return true;
    }


    /*
     * Movimentos normais.
     *
     * Não tentamos validar completamente aqui.
     * A validação real será feita quando montarmos
     * o estado interno do tabuleiro.
     */

    return /^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?$/.test(
        move
    );
}


/* =========================================================
   INFORMAÇÕES DA PARTIDA
   ========================================================= */

function getGameInfo(headers) {

    const result =
        headers.Result || '*';


    let winner =
        null;


    if (
        result === '1-0'
    ) {

        winner =
            headers.White || 'Brancas';

    } else if (
        result === '0-1'
    ) {

        winner =
            headers.Black || 'Pretas';
    }


    return {

        event:
            headers.Event || 'Partida',

        site:
            headers.Site || '',

        date:
            headers.Date || '',

        round:
            headers.Round || '',

        white:
            headers.White || 'Desconhecido',

        black:
            headers.Black || 'Desconhecido',

        result,

        winner

    };
}

