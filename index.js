import {Quiz} from './api.js';
import {layout} from './layout.js';

async function main() {
    const quiz = new Quiz();
    // TODO: Loady spinner
    await quiz.loadQuestions();
    await layout(quiz);

    document.querySelector('#loading').remove();
}

main();