import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App({quiz}) {
    const [started, setStarted] = useState(true);

    const renderedComponent = started
        ? html`<${Game} quiz=${quiz} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return html`
        <main>
            ${renderedComponent}
        </main>
        <footer>
            <small>Made with ❤️ by <a href="https://github.com/christianblais/" target="_blank">Christian Blais</a></small>
        </footer>
    `
}

function Welcome({startGame}) {
    return html`
        <h1>Géoquiz</h1>
        <p>
            Né de mon désir d'en connaître davantage sur le monde,
            Géoquiz est un jeu éducatif se servant de votre géolocalisation
            pour poser des questions ce qui vous entoure.
        </p>
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
        <h1>Loading…</h1>
        <p class="lds-ripple">
            <div></div>
            <div></div>
        </p>
    `
}

function Question({question, nextQuestion}) {
    const [answer, setAnswer] = useState(null);

    const renderedComponent = answer
        ? html`<${ShowAnswer} question=${question} answer=${answer} nextQuestion=${() => nextQuestion()} />`
        : html`<${AskQuestion} question=${question} setAnswer=${(answer) => setAnswer(answer)} />`

    return html`
        <h1>
            ${question['place']}
            <br />
            <small style="font-size: 0.4em;">
                ${question['meta']['distance'].toFixed(2)}km • ${question['meta']['latitude'].toFixed(2)}°,${question['meta']['longitude'].toFixed(2)}°
            </small>
        </h1>
        ${renderedComponent}
    `
}

function AskQuestion({question, setAnswer}) {
    return html`
        <p>
            <small>${question['category']}</small>
        </p>
        <h4>
            ${question['question']}
        </h4>
        <p>
            <button onclick=${() => setAnswer(question['answer'])}>Réponse</button>
        </p>
    `;
}

function ShowAnswer({question, answer, nextQuestion}) {
    return html`
        <p>
            <small>Réponse</small>
        </p>
        <h4>
            ${answer}
        </h4>
        <p>
            <button onclick=${() => nextQuestion()}>Question suivante</button>
        </p>
    `;
}

render(html`<${App} quiz=${new Quiz()} />`, document.body);
