import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App() {
    window.onbeforeunload = () => Quiz.serialize();

    Quiz.hydrate();

    const [started, setStarted] = useState(true);

    const renderedComponent = started
        ? html`<${Game} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return renderedComponent
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

function Game() {
    const [question, setQuestion] = useState(null)
    const [map, setMap] = useState(null)

    useEffect(() => {
        if (!question)
            Quiz.question().then((question) => setQuestion(question))
    }, [question]);

    useEffect(() => {
        setMap(
            new mapboxgl.Map({
                container: 'map-content',
                style: 'mapbox://styles/christianblais/cl7zh5oe9003m14moxjd77r4r',
                projection: 'globe',
                scrollZoom: false,
                zoom: 10
            })
        )
    }, [])

    const renderedComponent = question
        ? html`<${Question} question=${question} nextQuestion=${() => setQuestion(null)} />`
        : html`<${Loading} />`

    return html`
        <${Map} map=${map} question=${question} />
        ${renderedComponent}
    `
}

function Loading() {
    return html`
        <h1>Chargement…</h1>
    `
}

function Map({map, question}) {
    useEffect(() => {
        if (map && question)
            map.panTo([question.longitude, question.latitude], { duration: 2000 });
    }, [question])

    return html`
        <div id="map-wrapper">
            <div id="map-content"></div>
            <div id="map-overlay"></div>
        </div>
    `
}

function Question({question, nextQuestion}) {
    const [answer, setAnswer] = useState(null);

    const renderedComponent = answer
        ? html`<${ShowAnswer} question=${question} answer=${answer} nextQuestion=${() => nextQuestion()} />`
        : html`<${AskQuestion} question=${question} setUserChoice=${(answer) => setAnswer(answer)} />`

    return html`
        <h1>${question.place}</h1>
        ${renderedComponent}
    `
}

function AskQuestion({question, setUserChoice}) {
    useEffect(() => {
        // experimental feature, disabled by default
        return

        let voice = window.speechSynthesis.getVoices().find((v) => v.lang == "fr-CA");
        if (!voice) return;

        var msg = new SpeechSynthesisUtterance();
        msg.voice = voice;
        msg.text = question.question;
        msg.lang = 'fr-CA'
        
        window.speechSynthesis.speak(msg);
    }, [question]);
    
    let buttons = [];

    if (question.choices.length)
        question.choices.forEach((choice) => buttons.push([choice, choice]))
    else
        buttons.push([question.answer, 'Dévoiler'])

    return html`
        <p>
            <small>${question.category}</small>
        </p>
        <h4>
            ${question.question}
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

render(html`<${App} />`, document.body)
