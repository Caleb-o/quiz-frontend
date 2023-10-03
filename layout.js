/**
 * Sets the HTML view to represent the current section, question
 * and lists all answers of said question.
 */
function createQuestion(quiz) {
    const topicElement = document.querySelector('#topic');
    const titleElement = document.querySelector('#title');
    const answersElement = document.querySelector('#answers');

    answersElement.replaceChildren([]);

    const current = quiz.getCurrentQuestion();
    if (current === null) {
        return;
    }

    topicElement.innerHTML = quiz.getCurrentSection().name;
    titleElement.innerHTML = current.title;
    
    current.answers.forEach(answer => {
        const li = document.createElement('li');
        answersElement.appendChild(li);

        const radioButton = document.createElement('input')
        li.appendChild(radioButton);
        radioButton.id = answer.id;
        radioButton.value = answer.id;
        radioButton.type = 'radio';
        radioButton.name = 'answer';

        radioButton.addEventListener('click', () => {
            document.querySelector('#error').innerText = '';
            submitAnswer(quiz);
        });

        const label = document.createElement('label');
        li.appendChild(label);
        label.innerText = answer.text;
        label.htmlFor = answer.id;
    });
}

/**
 * Sets the HTML view to the end screen, which presents
 * the player's final score and the ability to restart.
 */
async function done(quiz) {
    document.querySelector('#topic').innerText = 'Loading score...';
    document.querySelector('#title').innerText = '';
    document.querySelector('#answers').replaceChildren([]);

    // Submit answers to get score
    const resp = await quiz.submitAnswers();

    if (Object.hasOwn(resp, 'error')) {
        showFatalError(resp.error);
        return;
    }
    
    const scoreText = document.querySelector('#topic');
    const totalQuestions = quiz.getTotalQuestionCount();
    scoreText.innerText = `You scored ${resp.score} / ${totalQuestions}`;

    const buttons = document.querySelector('#buttons');
    const restartButton = document.createElement('button');
    buttons.appendChild(restartButton);

    restartButton.innerText = 'Restart';
    restartButton.addEventListener('click', () => {
        scoreText.innerText = '';

        quiz.restart();
        createQuestion(quiz);
        restartButton.remove();
    });
}

function submitAnswer(quiz) {
    const button = document.querySelector('input[name="answer"]:checked');
    if (button === null) {
        showError("Select an answer");
        return;
    }

    quiz.answer(button.value);
    quiz.advance();

    if (quiz.isAtEnd()) {
        done(quiz);
    } else {
        createQuestion(quiz);
    }
}

/**
 * Entry point of the layout, which sets the initial view
 */
export async function layout(quiz) {
    createQuestion(quiz);

    // document.querySelector('#submit').addEventListener('click', () => {
        
    // });
}

/**
 * Sets the HTML view to show a current error
 * Note: Can be reset by selecting a radio field
 */
export function showError(msg) {
    document.querySelector('#error').innerText = msg;
}

/**
 * Sets the HTML view to show a current error, which might occur
 * because of a 503
 */
export function showFatalError(msg) {
    document.querySelector('#topic').innerText = 'Encountered an error';
    document.querySelector('#error').innerText = msg;
}