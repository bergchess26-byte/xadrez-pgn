'use strict';

const STORAGE_KEY_GAME = 'chess_study_current_game';
const STORAGE_KEY_NOTATION = 'chess_study_notation';

/**
 * Salva a partida atual no localStorage
 */
function saveGame(gameData) {
    if (!gameData) return;
    try {
        localStorage.setItem(STORAGE_KEY_GAME, JSON.stringify(gameData));
    } catch (e) {
        console.error('Erro ao salvar partida no localStorage:', e);
    }
}

/**
 * Carrega a partida salva do localStorage
 */
function loadGame() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_GAME);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Erro ao carregar partida do localStorage:', e);
        return null;
    }
}

/**
 * Remove a partida salva do localStorage
 */
function removeSavedGame() {
    try {
        localStorage.removeItem(STORAGE_KEY_GAME);
    } catch (e) {
        console.error('Erro ao remover partida do localStorage:', e);
    }
}

/**
 * Salva a preferência de notação (algebraic, pt, descriptive)
 */
function saveNotation(notation) {
    try {
        localStorage.setItem(STORAGE_KEY_NOTATION, notation);
    } catch (e) {
        console.error('Erro ao salvar notação no localStorage:', e);
    }
}

/**
 * Carrega a preferência de notação salva
 */
function loadNotation() {
    try {
        return localStorage.getItem(STORAGE_KEY_NOTATION) || 'algebraic';
    } catch (e) {
        console.error('Erro ao carregar notação do localStorage:', e);
        return 'algebraic';
    }
}

/**
 * Limpa todos os dados salvos da aplicação
 */
function clearSavedData() {
    try {
        localStorage.removeItem(STORAGE_KEY_GAME);
        localStorage.removeItem(STORAGE_KEY_NOTATION);
    } catch (e) {
        console.error('Erro ao limpar dados do localStorage:', e);
    }
}