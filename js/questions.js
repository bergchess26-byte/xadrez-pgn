'use strict';

/*
 * =========================================================
 * SISTEMA DE PERGUNTAS
 * =========================================================
 *
 * Este módulo é independente da lógica dos lances.
 *
 * Cada pergunta pode conter HTML.
 *
 * Exemplo:
 *
 * '<strong>Qual é o melhor lance?</strong>'
 *
 * ou:
 *
 * 'Explique por que <em>este lance</em> é importante.'
 *
 */


/* =========================================================
   PERGUNTAS
   ========================================================= */

/*
 * Basta adicionar, remover ou alterar as perguntas aqui.
 */

const studyQuestions = [

    '<p class="text-danger fw-semibold">1. DEPOIS DO LANCE DO TEU AMIGO.</p>',
    '<p>2. Foi esse o lance que esperava? </p>',
    '<p>3. Tinhas previsto isso? </p>',
    '<p>4. Sangue frio vale uma peça! </p>',
    '<p>5. Que peças estão atacadas pelo lance? </p>',
    '<p>6. Como estão defendidas? Estão mesmo? </p>',
    '<p>7. Quantas defesas contra quantos ataques? </p>',
    '<p>8. Examina a posição do teu Rei: </p><p>Está em perigo de xeque? De xeque descoberto? <br />Quantos lugares tem para ir? </p>',
    '<p>9. Que estão fazendo as peças atacadas? </p>',
    '<p>10. Cobrindo alguma coisa? </p>',
    '<p>11. As casas para onde podem fugir estão inteiramente defendidas? </p>',
    '<p>12. Poderiam ser levadas a um lugar onde atacassem algum ponto vital? </p>',
    '<p>13. Se está perdida a peça, não seria possível defendê-la por outra peça que, depois da troca, fosse ocupar uma boa posição? </p>',
    '<p>14. Quantos meios há de defendê-la? POUPAI a Dama! </p>',
    '<p>15. Que fazia o lance, onde estava antes? </p>',
    '<p>16. Cobrindo alguma coisa? </p>',
    '<p>17. Que está fazendo agora? </p>',
    '<p>18. O lance está atacado? Não será “cilada”? </p>',
    '<p>19. Sob a defesa de que peças está o lance, na casa que veio ocupar? </p>',
    '<p>20. O lance descobriu alguma peça que agora também ataca? </p>',
    '<p>21. Ou libertou alguma peça? </p>',
    '<p>22. Está obstruindo alguma peça? </p>',
    '<p>23. Ele ali permitirá que outra peça venha atacar? </p>',
    '<p>24. Estará defendendo uma casa para onde esteja sendo premeditado outro lance? </p>',
    '<p>25. Ou terá desocupado a casa, para que outra peça a venha ocupar?  </p>',
    '<p>26. Terá ido ali como defesa “extra”, que permita soltar uma das defesas atuais? </p>',
    '<p>27. Que “artes” anda a Dama inimiga imaginando? Ela está de branco ou de preto? </p>',
    '<p>28. Onde podem os Reis ir, neste momento? Não os perca de vista!... </p>',
    '<p>29. Existe alguma casa comandada por mais de duas ou três peças inimigas? </p>',
    '<p>30. Que tens para temer? </p>',
    '<p>31. Não poderás ser ainda mais temível? </p>',
    '<p>32. Que tal um ataque indireto? </p>',
    '<p>33. Sangue frio vale uma peça!</p>',
    '<p>34. Por que motivo teria teu amigo feito esse lance? </p>',
    '<p>35. Qual foi mesmo o lance que ele fez antes desse?</p>',
    '<p>36. Qual a posição do jogo do teu amigo?</p><p>Está atacando? O quê? Sozinha?<br />Está defendendo? O quê? Sózinha?<br />Está atacada? Por que peça?<br />Pode ser atacada?<br />Está defendida?<br />Onde pode ir? Que pode fazer?</p>',
    '<p>37. Quais são os pontos fracos? Os pontos fortes?</p><p>Decide, mas ESPERA! </p>',
    '<p class="text-danger fw-semibold">38. ANTES DO TEU LANCE </p>',
    '<p>39. Que estás fazendo, onde se acha a peça que pretendes mover?</p>',
    '<p>40. Podes, realmente, movê-la?</p>',
    '<p>41. Não será que precisas dela, onde ela está?  </p>',
    '<p>42. Está ocupando agora uma boa posição? </p>',
    '<p>43. Estará acaso melhor, depois de mover?</p>',
    '<p>44. Descobrirá outra peça que ataca?</p>',
    '<p>45. Irá impedir o avanço de alguma outra peça?</p>',
    '<p>46. Vai ficar atacada, ou passível de ataque, na nova casa para onde pretendes levá-la?</p>',
    '<p>47. Como estará defendida lá? </p>',
    '<p>48. Se ela tiver de recuar, poderá fazê-lo com facilidade? Com proveito? Sem vexame? </p>',
    '<p>49. Poderá o teu lance impedir o avanço do teu amigo, ou frustrar os seus planos?</p>',
    '<p>50. Que lance estará ele esperando? </p>',
    '<p>51. Não poderia ele responder-te com um lance mais intenso em outro lugar?</p>',
    '<p>52. As casas para onde pode fugir a peça que pretendes atacar acham-se fortemente defendidas?</p>',
    '<p>53. Qual é a finalidade exata do lance que queres fazer?</p>',
    '<p>54. Não haveria outro meio melhor de fazeres a mesma coisa?</p>',
    '<p>55. De que maneira esse lance servirá a teu Rei? </p>',
    '<p>56. O mais humilde Peão merece a mais encaniçada defesa!</p>',
    '<p>57. Existe alguma coisa mais prudente? Então, FOGO!</p>',
    '<p class="text-danger fw-semibold">58. DEPOIS DO TEU LANCE  </p>',
    '<p>59. Que peças estão atacadas pelo lance?</p>',
    '<p>60. Como estão defendidas? Estão mesmo?</p>',
    '<p>61. Quantas defesas contra quantos ataques?</p>',
    '<p>62. Examina a posição do Rei inimigo:</p><p>Está em perigo de xeque? De xeque descoberto?<br />Quantos lugares tem para ir? </p>',
    '<p>63. Que estão fazendo as peças atacadas? </p>',
    '<p>64. Cobrindo alguma coisa?</p>',
    '<p>65. As casas para onde podem fugir estão inteiramente defendidas?</p>',
    '<p>66. Poderiam ser levadas a um lugar de onde atacassem algum ponto vital?</p>',
    '<p>67. Que fazia o lance, onde estava antes?</p>',
    '<p>68. Cobrindo alguma coisa?</p>',
    '<p>69. Que está fazendo agora? </p>',
    '<p>70. Sob a defesa de que peças está o lance, na casa que foi ocupar? </p>',
    '<p>71. O lance descobriu alguma peça que agora também ataca?</p>',
    '<p>72. Ou libertou alguma peça? </p>',
    '<p>73. Está obstruindo alguma peça?</p>',
    '<p>74. Ele ali permitirá que outra peça vá atacar?</p>',
    '<p>75. Onde podem os Reis, ir neste momento? Não os percas de vista!...</p>',
    '<p>76. Qual é a posição do teu jogo? </p><p>Está atacando? O quê? Sozinha?<br />Está defendendo? O quê? Sózinha?<br />Está atacada? Por que peça?<br />Pode ser atacada?<br />Está defendida?<br />Onde pode ir? Que pode fazer?</p>',
    '<p>77. Quais são os pontos fracos? Os pontos fortes?</p>'

];


/* =========================================================
   ESTADO
   ========================================================= */

const questionsState = {

    currentQuestion: 0

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

let questionContent;
let questionProgressLabel;
let previousQuestionButton;
let nextQuestionButton;
let questionNumberInput;
let goToQuestionButton;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function initQuestions() {

    questionContent =
        document.getElementById(
            'questionContent'
        );

    questionProgressLabel =
        document.getElementById(
            'questionProgressLabel'
        );

    previousQuestionButton =
        document.getElementById(
            'previousQuestionButton'
        );

    nextQuestionButton =
        document.getElementById(
            'nextQuestionButton'
        );

    questionNumberInput =
        document.getElementById(
            'questionNumberInput'
        );

    goToQuestionButton =
        document.getElementById(
            'goToQuestionButton'
        );


    /*
     * Se o card não estiver presente,
     * simplesmente não inicializa.
     */

    if (
        !questionContent ||
        !questionProgressLabel ||
        !previousQuestionButton ||
        !nextQuestionButton ||
        !questionNumberInput ||
        !goToQuestionButton
    ) {
        return;
    }


    /*
     * Eventos.
     */

    previousQuestionButton.addEventListener(
        'click',
        previousQuestion
    );


    nextQuestionButton.addEventListener(
        'click',
        nextQuestion
    );


    goToQuestionButton.addEventListener(
        'click',
        goToQuestion
    );


    /*
     * Permite pressionar Enter no campo.
     */

    questionNumberInput.addEventListener(
        'keydown',
        function (event) {

            if (event.key === 'Enter') {

                event.preventDefault();

                goToQuestion();

            }

        }
    );


    /*
     * Exibe a primeira pergunta.
     */

    renderQuestion();

}


/* =========================================================
   EXIBIR PERGUNTA
   ========================================================= */

function renderQuestion() {

    if (!questionContent) {
        return;
    }


    /*
     * Não há perguntas.
     */

    if (studyQuestions.length === 0) {

        questionContent.innerHTML =
            '<p class="text-muted mb-0">Nenhuma pergunta disponível.</p>';

        questionProgressLabel.textContent = '';

        previousQuestionButton.disabled = true;
        nextQuestionButton.disabled = true;
        goToQuestionButton.disabled = true;

        return;
    }


    const index =
        questionsState.currentQuestion;


    const question =
        studyQuestions[index];


    /*
     * IMPORTANTE:
     *
     * innerHTML é usado de propósito.
     *
     * Isso permite que a pergunta contenha HTML.
     *
     * Exemplo:
     *
     * <strong>Qual é o melhor lance?</strong>
     */

    questionContent.innerHTML =
        question;


    /*
     * Indicador de progresso.
     */

    questionProgressLabel.textContent =
        `Pergunta ${index + 1} de ${studyQuestions.length}`;


    /*
     * Estado dos botões.
     */

    previousQuestionButton.disabled =
        index === 0;


    nextQuestionButton.disabled =
        index === studyQuestions.length - 1;


    /*
     * Mantém o campo coerente com a pergunta atual.
     */

    questionNumberInput.value =
        index + 1;

}


/* =========================================================
   PRÓXIMA PERGUNTA
   ========================================================= */

function nextQuestion() {

    if (
        questionsState.currentQuestion >=
        studyQuestions.length - 1
    ) {
        return;
    }


    questionsState.currentQuestion++;


    renderQuestion();

}


/* =========================================================
   PERGUNTA ANTERIOR
   ========================================================= */

function previousQuestion() {

    if (
        questionsState.currentQuestion <= 0
    ) {
        return;
    }


    questionsState.currentQuestion--;


    renderQuestion();

}


/* =========================================================
   IR PARA PERGUNTA
   ========================================================= */

function goToQuestion() {

    const value =
        Number(
            questionNumberInput.value
        );


    /*
     * Verifica se é um número válido.
     */

    if (
        !Number.isInteger(value)
    ) {

        questionNumberInput.focus();

        return;
    }


    /*
     * A numeração para o usuário começa em 1.
     * O array começa em 0.
     */

    if (
        value < 1 ||
        value > studyQuestions.length
    ) {

        questionNumberInput.focus();

        questionNumberInput.select();

        return;
    }


    questionsState.currentQuestion =
        value - 1;


    renderQuestion();

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    initQuestions
);
