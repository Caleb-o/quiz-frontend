import {Quiz, Section, Question, Answer} from '../api.js';

function questionFactory(title) {
    return new Question('id', title, [
        new Answer('a1', 'foo'),
        new Answer('a2', 'bar'),
    ]);
}

function sectionFactory(title) {
    return new Section(title, [
        questionFactory('What is foo?'),
        questionFactory('What is breakfast?'),
    ]);
}

function quizFactory() {
    const quiz = new Quiz();
    quiz.sections = [
        sectionFactory('Rust'),
        sectionFactory('JS'),
    ];

    return quiz;
}

function skipQuestions(quiz, n) {
    for (let i = 0; i < n; i+=1) {
        quiz.advance();
    }
}

describe('API', () => {
    it('Is not at the end when at start', () => {
        const quiz = quizFactory();
        expect(quiz.isAtEnd()).toBe(false);
    });

    it('Is at end when at start', () => {
        const quiz = quizFactory();
        skipQuestions(quiz, 4);
        expect(quiz.isAtEnd()).toBe(true);
    });

    it('Check Section is Rust', () => {
        const quiz = quizFactory();
        expect(quiz.getCurrentSection().name).toBe('Rust');
    });

    it('Check Next Section is JS', () => {
        const quiz = quizFactory();
        skipQuestions(quiz, 2);
        expect(quiz.getCurrentSection().name).toBe('JS');
    });

    it('Check first question title', () => {
        const quiz = quizFactory();
        expect(quiz.getCurrentQuestion().title).toBe('What is foo?');
    });
});