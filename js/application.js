import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'

function App() {
    const [started, setStarted] = useState(false)

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
            pour poser des questions sur ce qui vous entoure.
        </p>
        <p>
            <button onclick=${() => startGame()}>Débuter!</button>
        </p>
        <footer>
            <small>Fait avec ❤️ par <a href="https://christianblais.dev" target="_blank">Christian Blais</a></small>
        </footer>
    `
}

function Game() {
    const [question, setQuestion] = useState(null)

    useEffect(() => {
        Quiz.question().then((question) => setQuestion(question))
    }, [])

    const renderedComponent = question
        ? html`<${Question} question=${question} />`
        : html`<${Loading} />`

    return renderedComponent
}

function Loading() {
    return html`<div class="lds-ripple"><div></div><div></div></div>`
}

function Map({question}) {
    const [map, setMap] = useState(null)
    const [marker, setMarker] = useState(null)

    useEffect(() => {
        setMap(
            new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/christianblais/cl80aq5na001s14ls7fknchmz',
                projection: 'globe',
                scrollZoom: false,
                zoom: 10
            })
        )
    }, [])

    useEffect(() => {
        if (map) {
            map.panTo([question.longitude, question.latitude], { duration: 2000 });

            if (marker)
                marker.remove();

            setMarker(
                new mapboxgl.Marker()
                    .setLngLat([question.longitude, question.latitude])
                    .addTo(map)
            )
        }
    }, [map, question])

    return html`<div id="map"></div>`
}

function Question({...props}) {
    const [question, setQuestion] = useState(props.question)
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState(null)

    const buttons = []

    async function nextQuestion() {
        setAnswer(null)
        setLoading(true)
        setQuestion(await Quiz.question())
        setLoading(false)
    }

    function setUserChoice(choice) {
        setAnswer(choice)
    }

    function coordinates(value) {
        return (Math.round(value * 100) / 100).toFixed(2)
    }

    if (question.choices.length)
        question.choices.forEach((choice) => buttons.push([choice, choice]))
    else
        buttons.push([question.answer, 'Dévoiler'])

    return html`
        <${LoadingQuestion} loading=${loading} />
        <${Answer} question=${question} answer=${answer} nextQuestion=${() => nextQuestion()} />
    
        <h1>${question.place}</h1>
        
        <${Map} question=${question} />
        
        <small>${coordinates(question.latitude)}°, ${coordinates(question.longitude)}°</small>
        <p>${question.question}</p>
        ${buttons.map(([choice, text]) => html`<button onclick=${() => setUserChoice(choice)}>${text}</button>`)}
    `
}

function LoadingQuestion({loading}) {
    if (!loading) return
    
    return html`<div id="overlay"></div>`
}

function Answer({question, answer, nextQuestion}) {
    if (!answer) return

    const title = 
        question.choices.length
            ? question.answer == answer ? "Bravo!" : "Oops!"
            : "Réponse"

    return html`
        <div id="overlay">
            <div class="card">
                <p>${title}</p>
                <h1>${question.answer}</h1>
                <button onclick=${() => nextQuestion()}>Prochaine question</button>
            </div>
        </div>
    `
}

Quiz.clear();
window.onbeforeunload = () => Quiz.serialize();
Quiz.hydrate();

render(html`<${App} />`, document.body)
