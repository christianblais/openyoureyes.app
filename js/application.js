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
        <h1 class="lds-ripple">
            <div></div>
            <div></div>
        </h1>
    `
}

function Question({question, nextQuestion}) {
    const [answer, setAnswer] = useState(null);

    const renderedComponent = answer
        ? html`<${ShowAnswer} question=${question} answer=${answer} nextQuestion=${() => nextQuestion()} />`
        : html`<${AskQuestion} question=${question} setAnswer=${(answer) => setAnswer(answer)} />`

    return html`
        <h1>
            <small><i>${question['category']}</i></small>
            <br />
            ${question['place']}
            <br />
            <small style="font-size: 0.5em;">
                ${question['meta']['distance'].toFixed(2)}km • ${question['meta']['latitude'].toFixed(2)}°,${question['meta']['longitude'].toFixed(2)}°
            </small>
        </h1>
        ${renderedComponent}
    `
}

function AskQuestion({question, setAnswer}) {
    return html`
        <p>
            ${question['question']}
        </p>
        <footer>
            <button onclick=${() => setAnswer(question['answer'])}>Réponse</button>
        </footer>
    `;
}

function ShowAnswer({question, answer, nextQuestion}) {
    return html`
        <p>
            ${answer}
        </p>
        <footer>
            <button onclick=${() => nextQuestion()}>Question suivante</button>
        </footer>
    `;
}

render(html`<${App} quiz=${new Quiz()} />`, document.body);
