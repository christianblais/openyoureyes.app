import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App() {
    useEffect(() => {
        Quiz.hydrate();
        window.onbeforeunload = () => Quiz.serialize();
    }, [])

    const [started, setStarted] = useState(false);

    const renderedComponent = started
        ? html`<${Game} />`
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

function Game() {
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        if (!question)
            Quiz.question().then((question) => setQuestion(question))
    }, [question]);

    const renderedComponent = question
        ? html`<${Question} question=${question} nextQuestion=${() => setQuestion(null)} />`
        : html`<${Loading} />`

    return renderedComponent
}

function Loading() {
    return html`
        <h1>Chargement…</h1>
    `
}

function Map({origin, place}) {
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN0aWFuYmxhaXMiLCJhIjoiY2w3dW0xb3h2MDMxOTNvbnh4OXdkdWh1ZiJ9.aoPWChBJh4_nk1PU20H41Q';

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            projection: 'globe',
            bounds: [place, origin],
            fitBoundsOptions: { padding: { top: 10, right: 10, bottom: 10, left: 10 } }
        });

        new mapboxgl.Marker({ "color": "#000000" }).setLngLat(origin).addTo(map);
        new mapboxgl.Marker({ "color": "#FFFFFF" }).setLngLat(place).addTo(map);
        map.scrollZoom.disable();
    }, [])

    return html`
        <div style="width: 100%; height: 100px; position: relative;">
            <div id="map" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;"></div>
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
        <${Map} origin=${[question.currentLongitude, question.currentLatitude]} place=${[question.longitude, question.latitude]} />
        <small style="font-size: 0.4em;">
            ${question.distance.toFixed(2)}km • ${question.latitude.toFixed(2)}°, ${question.longitude.toFixed(2)}°
        </small>
        ${renderedComponent}
    `
}

function AskQuestion({question, setUserChoice}) {
    useEffect(() => {
        let voice = window.speechSynthesis.getVoices().find((v) => v.lang == "fr-CA");
        if (!voice) return;

        var msg = new SpeechSynthesisUtterance();
        msg.voice = voice;
        msg.text = question.question;
        msg.lang = 'fr-CA'
        
        // window.speechSynthesis.speak(msg);
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
