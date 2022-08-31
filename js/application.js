import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App({quiz}) {
    const [started, setStarted] = useState(false);

    const renderedComponent = started
        ? html`<${Game} quiz=${quiz} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return renderedComponent
}

function Welcome({startGame}) {
    return html`
        <h1>Bienvenue</h1>
        <p>
            <button onclick=${() => startGame()}>Débuter!</button>
        </p>
    `
}

function Game({quiz}) {
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        if (!question)
            quiz.question().then((question) => setQuestion(question))
    }, [question]);

    const renderedComponent = question
        ? html`<${Question} question=${question} nextQuestion=${() => setQuestion(null)} />`
        : html`<${Loading} />`

    return renderedComponent
}

function Loading() {
    return html`
        <p id="loading">Loading...</p>
    `
}

function Question({question, nextQuestion}) {
    const [answer, setAnswer] = useState(null);

    const renderedComponent = answer
        ? html`<${ShowAnswer} answer=${answer} nextQuestion=${() => nextQuestion()} />`
        : html`<${AskQuestion} question=${question} setAnswer=${(answer) => setAnswer(answer)} />`

    return renderedComponent
}

function AskQuestion({question, setAnswer}) {
    return html`
        <div>
            Question: ${JSON.stringify(question)}
            <button onclick=${() => setAnswer(1)}>Answer</button>
        </div>
    `;
}

function ShowAnswer({answer, nextQuestion}) {
    return html`
        <div>
            Answer: ${JSON.stringify(answer)}
            <button onclick=${() => nextQuestion()}>Next</button>
        </div>
    `;
}

render(html`<${App} quiz=${new Quiz()} />`, document.body);
