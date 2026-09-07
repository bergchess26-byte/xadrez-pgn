'use strict';

let currentGame = null;
let preferredNotation = loadNotation();


/* =========================================================
   ELEMENTOS
   ========================================================= */

const pgnFile = document.getElementById('pgnFile');
const pgnText = document.getElementById('pgnText');
const importButton = document.getElementById('importButton');
const importError = document.getElementById('importError');

const importModalElement = document.getElementById('importModal');

const gameSection = document.getElementById('gameSection');

const eventName = document.getElementById('eventName');
const gameType = document.getElementById('gameType');

const whitePlayer = document.getElementById('whitePlayer');
const blackPlayer = document.getElementById('blackPlayer');
const gameDate = document.getElementById('gameDate');

const resultHidden = document.getElementById('resultHidden');
const resultVisible = document.getElementById('resultVisible');

const gameResult = document.getElementById('gameResult');
const winnerName = document.getElementById('winnerName');

const showResultButton =
    document.getElementById('showResultButton');

const movesTableBody =
    document.getElementById('movesTableBody');

const progressLabel =
    document.getElementById('progressLabel');

const previousMoveButton =
    document.getElementById('previousMoveButton');

const nextMoveButton =
    document.getElementById('nextMoveButton');

const restartButton =
    document.getElementById('restartButton');

const newGameButton =
    document.getElementById('newGameButton');

const clearStorageButton =
    document.getElementById('clearStorageButton');

const notationButtons =
    document.querySelectorAll(
        '[data-notation]'
    );

/* Elementos Adicionais para Tabuleiro e Navegação */
const flipBoardButton = document.getElementById('flipBoardButton');
const jumpMoveInput = document.getElementById('jumpMoveInput');
const jumpMoveButton = document.getElementById('jumpMoveButton');


/* =========================================================
   IMPORTAÇÃO
   ========================================================= */

importButton.addEventListener('click', importGame);


async function importGame() {

    hideImportError();

    let text = pgnText.value.trim();

    /*
     * Se houver arquivo selecionado, damos prioridade
     * ao arquivo.
     */
    if (pgnFile.files.length > 0) {

        try {

            text = await pgnFile.files[0].text();

        } catch (error) {

            showImportError(
                'Não foi possível ler o arquivo PGN.'
            );

            return;
        }
    }

    if (!text) {

        showImportError(
            'Selecione um arquivo PGN ou cole o conteúdo da partida.'
        );

        return;
    }


    try {

        const parsed = parsePGN(text);

        const info = getGameInfo(parsed.headers);


        /*
        * Constrói o histórico interno da posição.
        */
        let history;

        try {

            history =
                buildMoveHistory(
                    parsed.moves
                );

        } catch (error) {

            showImportError(
                error.message
            );

            return;
        }


        currentGame = {

            pgn: text,

            headers:
                parsed.headers,

            moves:
                parsed.moves,

            history,

            info,

            currentPly:
                0,

            notation:
                preferredNotation,

            resultVisible:
                false,

            boardOrientation:
                'white'
        };

        saveGame(currentGame);

        updateNotationButtons();

        renderGame();

        closeImportModal();



    } catch (error) {

        showImportError(
            error.message || 'Não foi possível interpretar o PGN.'
        );
    }
}


/* =========================================================
   RENDERIZAÇÃO DA PARTIDA
   ========================================================= */

function renderGame() {

    if (!currentGame) {
        return;
    }

    const info = currentGame.info;


    /*
     * Informações
     */

    eventName.textContent = info.event;

    whitePlayer.textContent = info.white;
    blackPlayer.textContent = info.black;

    gameDate.textContent = formatDate(info.date);

    gameType.textContent = detectGameType(
        currentGame.headers
    );


    /*
     * Resultado
     */

    renderResult();


    /*
     * Tabela de Lances
     */

    renderMoves();


    /*
     * Tabuleiro Visual
     */

    renderCurrentBoard();


    /*
     * Controles
     */

    updateMoveControls();


    /*
     * Mostra a área da partida
     */

    gameSection.classList.remove('d-none');
}


/* =========================================================
   RENDERIZAÇÃO DO TABULEIRO
   ========================================================= */

function renderCurrentBoard() {

    if (!currentGame) {
        return;
    }

    const ply = currentGame.currentPly;
    let boardState;
    let highlightMove = null;

    if (ply === 0) {
        boardState = createBoard();
    } else {
        const lastMove = currentGame.history[ply - 1];
        boardState = lastMove ? lastMove.boardAfter : createBoard();
        if (lastMove) {
            highlightMove = {
                from: lastMove.from,
                to: lastMove.to
            };
        }
    }

    const isFlipped = (currentGame.boardOrientation === 'black');
    renderBoard(boardState, 'board', isFlipped, highlightMove);
}


/* =========================================================
   RESULTADO
   ========================================================= */

showResultButton.addEventListener(
    'click',
    () => {

        if (!currentGame) {
            return;
        }

        currentGame.resultVisible = true;

        saveGame(currentGame);

        renderResult();
    }
);


function renderResult() {

    if (!currentGame) {
        return;
    }

    if (currentGame.resultVisible) {

        resultHidden.classList.add('d-none');

        resultVisible.classList.remove('d-none');

        gameResult.textContent =
            currentGame.info.result;

        if (currentGame.info.winner) {

            winnerName.textContent =
                `Vencedor: ${currentGame.info.winner}`;

        } else {

            winnerName.textContent =
                'Empate ou resultado não definido';
        }

        showResultButton.classList.add('d-none');

    } else {

        resultHidden.classList.remove('d-none');

        resultVisible.classList.add('d-none');

        showResultButton.classList.remove('d-none');
    }
}


/* =========================================================
   TABELA DE LANCES
   ========================================================= */

function renderMoves() {

    movesTableBody.innerHTML = '';

    if (!currentGame) {
        return;
    }


    const revealedPlies =
        currentGame.currentPly;


    if (revealedPlies === 0) {
        return;
    }


    /*
     * Quantas linhas já podem existir.
     */

    const visibleRows =
        Math.ceil(
            revealedPlies / 2
        );


    for (
        let rowIndex = 0;
        rowIndex < visibleRows;
        rowIndex++
    ) {

        const row =
            document.createElement('tr');


        /*
         * Número.
         */

        const numberCell =
            document.createElement('td');

        numberCell.textContent =
            `${rowIndex + 1}.`;


        /*
         * Brancas.
         */

        const whiteCell =
            document.createElement('td');

        const whitePlyIndex =
            rowIndex * 2;


        if (
            whitePlyIndex < revealedPlies &&
            currentGame.history[whitePlyIndex]
        ) {

            whiteCell.textContent =
                convertMove(
                    currentGame.history[
                        whitePlyIndex
                    ]
                );

            whiteCell.style.cursor = 'pointer';
            whiteCell.title = `Ir para o lance ${whitePlyIndex + 1}`;
            whiteCell.addEventListener('click', () => {
                jumpToPly(whitePlyIndex + 1);
            });

            if (whitePlyIndex === currentGame.currentPly - 1) {
                whiteCell.classList.add('table-active', 'fw-bold');
            }
        }


        /*
         * Pretas.
         */

        const blackCell =
            document.createElement('td');

        const blackPlyIndex =
            rowIndex * 2 + 1;


        if (
            blackPlyIndex < revealedPlies &&
            currentGame.history[blackPlyIndex]
        ) {

            blackCell.textContent =
                convertMove(
                    currentGame.history[
                        blackPlyIndex
                    ]
                );

            blackCell.style.cursor = 'pointer';
            blackCell.title = `Ir para o lance ${blackPlyIndex + 1}`;
            blackCell.addEventListener('click', () => {
                jumpToPly(blackPlyIndex + 1);
            });

            if (blackPlyIndex === currentGame.currentPly - 1) {
                blackCell.classList.add('table-active', 'fw-bold');
            }
        }


        row.appendChild(numberCell);
        row.appendChild(whiteCell);
        row.appendChild(blackCell);

        movesTableBody.appendChild(row);
    }
}


/* =========================================================
   IR PARA UM LANCE ESPECÍFICO (JUMP TO PLY/MOVE)
   ========================================================= */

function jumpToPly(targetPly) {
    if (!currentGame) return;

    // Garante que o ply fique dentro do limite válido (0 até o total de lances)
    const plyNumber = Math.max(0, Math.min(targetPly, currentGame.moves.length));

    currentGame.currentPly = plyNumber;

    saveGame(currentGame);

    renderMoves();
    renderCurrentBoard();
    updateMoveControls();
}

/**
 * Função executada ao clicar no botão "Ir" ou pressionar Enter no campo
 */
function handleJumpMove() {
    if (!currentGame || !jumpMoveInput) return;

    const moveNumber = parseInt(jumpMoveInput.value, 10);

    // Se o valor for inválido ou menor/igual a 0, vai para o início
    if (isNaN(moveNumber) || moveNumber <= 0) {
        jumpToPly(0);
        return;
    }

    /*
     * Converte o número da jogada (Move) para a quantidade de Plies (meio-lances).
     * Exemplo:
     * - Lance 1 -> Pula para a jogada das Brancas no lance 1 (ply 1)
     * - Lance 10 -> Pula para a jogada das Brancas no lance 10 (ply 19)
     */
    const targetPly = (moveNumber - 1) * 2 + 1;

    jumpToPly(targetPly);
}

// Clique no botão "Ir"
if (jumpMoveButton) {
    jumpMoveButton.addEventListener('click', handleJumpMove);
}

// Pressionar a tecla Enter dentro do campo de texto/número
if (jumpMoveInput) {
    jumpMoveInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleJumpMove();
        }
    });
}


/* =========================================================
   AVANÇAR
   ========================================================= */

nextMoveButton.addEventListener(
    'click',
    () => {

        if (!currentGame) {
            return;
        }


        if (
            currentGame.currentPly <
            currentGame.moves.length
        ) {

            currentGame.currentPly++;

            saveGame(currentGame);

            renderMoves();
            renderCurrentBoard();
            updateMoveControls();
        }

    }
);


/* =========================================================
   VOLTAR
   ========================================================= */

previousMoveButton.addEventListener(
    'click',
    () => {

        if (!currentGame) {
            return;
        }

        if (currentGame.currentPly > 0) {

            currentGame.currentPly--;

            saveGame(currentGame);

            renderMoves();
            renderCurrentBoard();
            updateMoveControls();
        }

    }
);


/* =========================================================
   INVERTER PERSPECTIVA DO TABULEIRO
   ========================================================= */

if (flipBoardButton) {
    flipBoardButton.addEventListener('click', () => {
        if (!currentGame) return;

        currentGame.boardOrientation =
            flipBoardOrientation(currentGame.boardOrientation || 'white');

        saveGame(currentGame);
        renderCurrentBoard();
    });
}


/* =========================================================
   CONTROLES
   ========================================================= */

function updateMoveControls() {

    if (!currentGame) {
        return;
    }

    /*
     * Voltar fica desabilitado no início.
     */

    previousMoveButton.disabled =
        currentGame.currentPly === 0;


    /*
     * Avançar fica desabilitado somente
     * quando todos os plies foram revelados.
     */

    const finished =
        currentGame.currentPly >=
        currentGame.moves.length;

    nextMoveButton.disabled = finished;


    /*
     * Durante o estudo não mostramos
     * quantos lances a partida possui.
     *
     * Só informamos quando terminou.
     */

    if (finished) {

        progressLabel.textContent =
            'Partida concluída';

    } else {

        progressLabel.textContent = '';
    }
}


/* =========================================================
   REINICIAR ESTUDO
   ========================================================= */

restartButton.addEventListener(
    'click',
    () => {

        if (!currentGame) {
            return;
        }

        const confirmed = confirm(
            'Reiniciar o estudo desta partida?'
        );

        if (!confirmed) {
            return;
        }


        currentGame.currentPly = 0;
        currentGame.resultVisible = false;

        saveGame(currentGame);

        renderGame();


    }
);


/* =========================================================
   NOVA PARTIDA
   ========================================================= */

newGameButton.addEventListener(
    'click',
    () => {

        const confirmed = confirm(
            'Deseja sair da partida atual e importar uma nova?'
        );

        if (!confirmed) {
            return;
        }

        currentGame = null;

        removeSavedGame();

        gameSection.classList.add('d-none');

        pgnFile.value = '';
        pgnText.value = '';

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                importModalElement
            );

        modal.show();
    }
);


/* =========================================================
   LIMPAR DADOS
   ========================================================= */

clearStorageButton.addEventListener(
    'click',
    () => {

        const confirmed = confirm(
            'Deseja realmente limpar os dados salvos?'
        );

        if (!confirmed) {
            return;
        }


        clearSavedData();

        currentGame = null;

        gameSection.classList.add('d-none');

        alert('Dados salvos removidos.');


    }
);


/* =========================================================
   NOTAÇÃO
   ========================================================= */

notationButtons.forEach(button => {

    button.addEventListener(
        'click',
        () => {

            if (!currentGame) {
                return;
            }


            /*
             * Obtém a notação definida no botão.
             */

            const notation =
                button.dataset.notation;


            if (!notation) {
                return;
            }


            /*
             * Atualiza a partida atual.
             */

            currentGame.notation =
                notation;


            /*
             * Atualiza a preferência global.
             */

            preferredNotation =
                notation;


            /*
             * Persiste a escolha.
             */

            saveNotation(
                notation
            );

            saveGame(
                currentGame
            );


            /*
             * Atualiza visualmente os botões.
             */

            updateNotationButtons();


            /*
             * Redesenha os lances.
             *
             * Não alteramos currentPly.
             *
             * Portanto o usuário continua exatamente
             * no mesmo ponto da partida.
             */

            renderMoves();
        }
    );
});


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatDate(date) {

    if (!date || date === '????.??.??') {
        return 'Não informada';
    }

    const parts = date.split('.');

    if (parts.length !== 3) {
        return date;
    }

    const [
        year,
        month,
        day
    ] = parts;

    if (
        year.length !== 4 ||
        month === '??' ||
        day === '??'
    ) {
        return date;
    }

    return `${day}/${month}/${year}`;
}


function detectGameType(headers) {

    /*
     * Futuramente podemos interpretar
     * TimeControl, Event e outras tags.
     */

    if (headers.TimeControl) {

        return `Controle de tempo: ${headers.TimeControl}`;
    }

    return headers.Event
        ? headers.Event
        : 'Tipo não informado';
}


/* =========================================================
   MODAL
   ========================================================= */

function closeImportModal() {

    const modal =
        bootstrap.Modal.getInstance(
            importModalElement
        );

    if (modal) {
        modal.hide();
    }
}


/* =========================================================
   ERROS
   ========================================================= */

function showImportError(message) {

    importError.textContent = message;

    importError.classList.remove('d-none');
}


function hideImportError() {

    importError.textContent = '';

    importError.classList.add('d-none');
}


function updateNotationButtons() {

    if (!notationButtons) {
        return;
    }


    const notation =
        currentGame?.notation ||
        preferredNotation ||
        'algebraic';


    notationButtons.forEach(button => {

        const isActive =
            button.dataset.notation ===
            notation;


        button.classList.toggle(
            'active',
            isActive
        );
    });
}


/* =========================================================
   RESTAURAÇÃO AUTOMÁTICA
   ========================================================= */

function restoreSavedGame() {

    const savedGame = loadGame();

    if (!savedGame || !savedGame.pgn) {
        return;
    }

    try {

        const parsed =
            parsePGN(savedGame.pgn);

        const info =
            getGameInfo(parsed.headers);


        const history =
            buildMoveHistory(
                parsed.moves
            );


        /*
         * Garante que o progresso salvo
         * não ultrapasse o tamanho da partida.
         */

        const currentPly = Math.min(
            Number(savedGame.currentPly) || 0,
            parsed.moves.length
        );


        /*
         * Recupera a notação salva.
         */

        const notation =
            savedGame.notation ||
            preferredNotation;


        currentGame = {

            pgn: savedGame.pgn,

            headers: parsed.headers,

            moves: parsed.moves,

            history,

            info,

            currentPly,

            notation,

            resultVisible:
                savedGame.resultVisible === true,

            boardOrientation:
                savedGame.boardOrientation || 'white'
        };


        preferredNotation = notation;


        updateNotationButtons();

        renderGame();


    } catch (error) {

        console.error(
            'Não foi possível restaurar a partida.',
            error
        );

        removeSavedGame();
    }
}


/*
 * Tenta restaurar a partida quando
 * a página termina de carregar.
 */

restoreSavedGame();