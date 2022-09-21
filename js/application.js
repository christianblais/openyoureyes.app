import { html, render, useState, useEffect } from 'https://unpkg.com/htm/preact/standalone.module.js'
import Quiz from './quiz.js'
import { Text, locale } from './i18n.js'

function App() {
    const [started, setStarted] = useState(false)

    const renderedComponent = started
        ? html`<${Game} />`
        : html`<${Welcome} startGame=${() => setStarted(true)} />`

    return renderedComponent
}

function Welcome({startGame}) {
    return html`
        <h1>${Text('welcome.title')}</h1>
        <p>${Text('welcome.description')}</p>
        <p>
            <button onclick=${() => startGame()}>${Text('welcome.action')}</button>
        </p>
        <footer>
            <small>${Text('welcome.notice')} <a href="https://christianblais.dev" target="_blank">Christian Blais</a></small>
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
            map.panTo([question.longitude, question.latitude], { duration: 2000 })

            if (marker)
                marker.remove()

            setMarker(
                new mapboxgl.Marker()
                    .setLngLat([question.longitude, question.latitude])
                    .addTo(map)
            )
        }
    }, [map, question])

    return html`<div id="map"></div>`
}

function Menu() {
    function clearHistory() {
        Quiz.clear()
        window.location.reload()
    }

    const localeLink = locale == "en"
        ? html`<a href="https://ouvretesyeux.app">Version française</a>`
        : html`<a href="https://openyoureyes.app">English version</a>`
    
    return html`
        <header>
            <div id="menu">
                <input type="checkbox" />
                
                <div id="menu-icon">
                    ☰
                </div>

                <ul id="menu-slider">
                    <li><a href="#" onclick=${() => clearHistory()}>${Text('menu.clearHistory')}</a></li>
                    <li><a href="https://github.com/christianblais/openyoureyes.app">${Text('menu.viewSource')} ⧉</a></li>
                    <li>${localeLink}</li>
                </ul>
            </div>
        </header>
    `
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

    function coordinates(value) {
        return (Math.round(value * 100) / 100).toFixed(2)
    }

    if (question.choices.length)
        question.choices.forEach((choice) => buttons.push([choice, choice]))
    else
        buttons.push([question.answer, Text(`question.showAnswer`)])

    return html`
        <${Menu} />
        
        <${LoadingQuestion} loading=${loading} />
        <${Answer} question=${question} answer=${answer} nextQuestion=${() => nextQuestion()} />
        
        <${Map} question=${question} />
        <small>${coordinates(question.latitude)}°, ${coordinates(question.longitude)}°</small>

        <h1>${question.place}</h1>

        <p>${question.question}</p>
        ${buttons.map(([choice, text]) => html`<button onclick=${() => setAnswer(choice)}>${text}</button>`)}
    `
}

function LoadingQuestion({loading}) {
    if (!loading) return
    
    return html`<div id="overlay"></div>`
}

function Answer({question, answer, nextQuestion}) {
    if (!answer) return

    useEffect(() => {
        if (answer)
            window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [answer])

    const title = 
        question.choices.length
            ? question.answer == answer ? Text('answer.bravo') : Text('answer.oops')
            : Text('answer.neutral')

    return html`
        <div id="overlay">
            <div class="card">
                <p>${title}</p>
                <h1>${question.answer}</h1>
                <button onclick=${() => nextQuestion()}>${Text('question.next')}</button>
            </div>
        </div>
    `
}

window.onbeforeunload = () => Quiz.serialize()
Quiz.hydrate()

render(html`<${App} />`, document.body)
