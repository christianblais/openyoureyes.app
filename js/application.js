import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App({quiz}) {
    const [started, setStarted] = useState(false);

    const renderedComponent = started
        ? html`<${Game} quiz=${quiz} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return html`
        <main>
            ${renderedComponent}
        </main>
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
        <footer>
            <small>Fait avec ❤️ par <a href="https://github.com/christianblais/" target="_blank">Christian Blais</a></small>
        </footer>
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
        <h1>Chargement…</h1>
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
        : html`<${AskQuestion} question=${question} setUserChoice=${(answer) => setAnswer(answer)} />`

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

function AskQuestion({question, setUserChoice}) {
    let buttons = [];

    if (question['choices'].length)
        question['choices'].forEach((choice) => buttons.push([choice, choice]))
    else
        buttons.push([question['answer'], 'Dévoiler'])

    return html`
        <p>
            <small>${question['category']}</small>
        </p>
        <h4>
            ${question['question']}
        </h4>
        <p>
            ${buttons.map(([choice, text]) => html`<button style="width: 200px" onclick=${() => setUserChoice(choice)}>${text}</button><br />`)}
        </p>
    `;
}

function ShowAnswer({question, answer, nextQuestion}) {
    let color;
    let text;

    if (question['choices'].length)
    {
        if (question['answer'] == answer)
        {
            color = "#588c7e"
            text = "Bravo!"
        }
        else
        {
            color = "#d96459"
            text = "Oops!"
        }
    }
    else
    {
        color = 'inherit'
        text = "Réponse"
    }

    return html`
        <p>
            <small>${text}</small>
        </p>
        <h3 style="color: ${color}">
            ${question['answer']}
        </h3>
        <p>
            <button onclick=${() => nextQuestion()}>Prochaine question</button>
        </p>
    `;
}

render(html`<${App} quiz=${new Quiz()} />`, document.body);
