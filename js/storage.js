'use strict';

/*
 * =========================================================
 * ARMAZENAMENTO LOCAL
 * =========================================================
 *
 * Tudo fica salvo no navegador através do localStorage.
 *
 * Não utilizamos servidor ou banco de dados.
 */

const STORAGE_KEY = 'chess-study-game';
const NOTATION_KEY = 'chess-study-notation';


/**
 * Salva a partida atual.
 */
function saveGame(game) {

    if (!game) {
        return;
    }

    const data = {
        pgn: game.pgn,
        currentPly: game.currentPly,
        notation: game.notation,
        resultVisible: game.resultVisible
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/**
 * Recupera a partida salva.
 */
function loadGame() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            'Não foi possível recuperar a partida salva.',
            error
        );

        return null;
    }
}


/**
 * Remove a partida salva.
 */
function removeSavedGame() {

    localStorage.removeItem(STORAGE_KEY);
}


/**
 * Salva a preferência de notação.
 */
function saveNotation(notation) {

    if (!notation) {
        return;
    }

    localStorage.setItem(
        NOTATION_KEY,
        notation
    );
}


/**
 * Recupera a preferência de notação.
 *
 * Caso não exista, usamos Algébrica.
 */
function loadNotation() {

    return (
        localStorage.getItem(NOTATION_KEY)
        || 'algebraic'
    );
}


/**
 * Remove todos os dados da aplicação.
 */
function clearSavedData() {

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTATION_KEY);
}

