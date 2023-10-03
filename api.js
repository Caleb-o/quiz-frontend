import { showFatalError } from "./layout.js";

const QUESTION_URL = 'https://super-awesome-quiz.vercel.app/questions';
const ANSWER_URL = 'https://super-awesome-quiz.vercel.app/score';

/**
 * This represents a topic which contains questions
 */
export class Section {
    constructor(name, questions) {
        this.name = name;
        this.questions = questions;
    }
}

/**
 * User provided answer for a given question
 * Note: Not the answer option displayed
 */
export class Answer {
    constructor(question, answer) {
        this.id = question;
        this.answer = answer;
    }
}

/**
 * Question contains all answers and a title
 * Note: Answers are based from the response before transformation
 */
export class Question {
    constructor(id, title, answers) {
        this.id = id;
        this.title = title;
        this.answers = answers;
    }
}

/**
 * Main API for all quiz logic
 */
export class Quiz {
    constructor() {
        this.currentSection = 0;
        this.currentQuestion = 0;

        this.sections = [];
        this.answers = [];
    }

    /**
     * Checks if the quiz is completed, which means the final
     * question and section has been advanced to completion
     */
    isAtEnd() {
        if (this.currentSection >= this.sections.length) {
            return true;
        }

        const sections = this.sections.length;
        const questions = this.getCurrentSection().questions.length;
        return this.currentSection >= sections && this.currentQuestion >= questions;
    }

    /**
     * Returns the currently selected section
     */
    getCurrentSection() {
        return this.sections[this.currentSection];
    }
    
    /**
     * Returns the currently selected question
     */
    getCurrentQuestion() {
        if (this.isAtEnd()) {
            return null;
        }

        return this.getCurrentSection().questions[this.currentQuestion];
    }

    /**
     * Resets internal data to revert back to the start
     * Note: Does not reset the HTML view
     */
    restart() {
        this.answers = [];
        this.currentSection = 0;
        this.currentQuestion = 0;
    }

    /**
     * Increases the queston counter, and will increment the section
     * counter once the final question is completed.
     */
    advance() {
        this.currentQuestion += 1;
        if (this.currentQuestion >= this.getCurrentSection().questions.length) {
            this.currentQuestion = 0;
            this.currentSection += 1;
        }
    }

    /**
     * Returns the total number of questions, across all sections
     */
    getTotalQuestionCount() {
        return this.sections.reduce((acc, sec) => 
            acc + sec.questions.length
        , 0);
    }

    /**
     * Pushes the answer to an internal buffer, to be submitted with
     * `submitAnswers()`
     */
    answer(value) {
        const currentQuestion = this.getCurrentQuestion();
        this.answers.push(new Answer(currentQuestion.id, value));
    }

    /**
     * Sends a POST request with all answers to receive the 
     * player's final score of the quiz.
     */
    async submitAnswers() {
        // Post my answers
        let resp = await fetch(ANSWER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                answers: this.answers,
            }),
        }).then(resp => resp.json());

        // Reset
        this.answers = [];
        return resp;
    }

    /**
     * Sends a GET request to fetch all questions
     */
    async loadQuestions() {
        let resp = await fetch(QUESTION_URL).then(data => data.json());
        if (Object.hasOwn(resp, 'error')) {
            showFatalError(resp.error);
            return;
        }

        resp.sections.forEach(sec => {
            const questions = [];

            sec.questions.forEach(q => {
                questions.push(new Question(
                    q.id,
                    q.question_text,
                    q.answer_options,
                ));
            });

            this.sections.push(new Section(
                sec.section_name,
                questions,
            ))
        });
    }
}