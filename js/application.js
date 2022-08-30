import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App() {
    const [started, setStarted] = useState(false);

    const renderedComponent = started
        ? html`<${Game} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return renderedComponent
}

function Welcome({startGame}) {
    return html`<button onclick=${() => startGame()}>Welcome</button>`
}

function Game() {
    const [question, setQuestion] = useState(null);

    const renderedComponent = question
        ? html`<${Question} question=${question} nextQuestion=${() => setQuestion(null)} />`
        : html`<${Loading} setQuestion=${(question) => setQuestion(question)} />`

    return renderedComponent
}

function Loading({setQuestion}) {
    useEffect(() => {
        setQuestion(Quiz.Questions.sample());
      }, []);
    
    return "Loading..."
}

function Question({question, nextQuestion}) {
    const [answer, setAnswer] = useState(null);

    const renderedComponent = answer
        ? html`<${ShowAnswer} answer=${answer} continue=${() => nextQuestion()} />`
        : html`<${AskQuestion} question=${question} setAnswer=${(answer) => setAnswer(answer)} />`

    return renderedComponent
}

function AskQuestion({question}) {
    return html`<div>Question: ${JSON.stringify(question)}</div>`;
}

function ShowAnswer({answer}) {
    return html`<div>Answer: ${JSON.stringify(answer)}</div>`;
}

render(html`<${App} />`, document.body);
