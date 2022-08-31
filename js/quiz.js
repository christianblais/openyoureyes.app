import Wikidata from './wikidata.js'

class Quiz
{
    static Categories = {}

    static getCurrentPosition()
    {
        return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }

    static parseField(wikidataBinding)
    {
        switch(wikidataBinding['datatype'])
        {
            case "http://www.w3.org/2001/XMLSchema#dateTime":
                return new Date(wikidataBinding['value']).toLocaleDateString()
            default:
                return wikidataBinding['value']
        }
    }

    static parse(wikidataBindings)
    {
        return Object.entries(wikidataBindings).reduce((entries, entry) => {
            entries[entry[0]] = this.parseField(entry[1]); return entries
        }, {})
    }

    question()
    {
        let categories = Object.entries(Quiz.Categories)
        let category = categories[Math.floor(Math.random() * categories.length)][1]

        return this.constructor.getCurrentPosition()
            .then((geolocation) => geolocation.coords)
            .then(({latitude, longitude}) => category.getQueryString(latitude, longitude))
            .then((queryString) => Wikidata.query(queryString))
            .then((results) => results[0])
            .then((response) => this.constructor.parse(response))
            .then((parsedResponse) => category.createQuestion(parsedResponse))
    }
}

Quiz.Category = class {
    static createQuestion(entry)
    {
        return {
            question: this.questionText(entry['placeLabel']),
            answer: entry['value'],
            meta: {
                distance: entry['distance'],
                latitude: entry['latitude'],
                longitude: entry['longitude'],
            }
        }
    }

    static getQueryString(lat, lon)
    {
        return `
            SELECT DISTINCT
                ?placeLabel
                ?distance
                ?longitude
                ?latitude
                (SAMPLE(?value) as ?value)
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place wdt:P31 wd:Q27676416 .
                ?place p:P625 [ psv:P625 [  wikibase:geoLongitude ?longitude ; wikibase:geoLatitude ?latitude ] ].
                ?place ${this.wikidataID} ?value .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?placeLabel ?distance ?longitude ?latitude
            ORDER BY ?distance LIMIT 1
        `
    }
}

Quiz.Categories.Area = class extends Quiz.Category {
    static wikidataID = "wdt:P2046"

    static questionText(placeLabel)
    {
        return `Approximativement, sur quelle superficie s'étend la ville de ${placeLabel}?`
    }
}

Quiz.Categories.Demonym = class extends Quiz.Category {
    static wikidataID = "wdt:P1549"

    static questionText(placeLabel)
    {
        return `Comment appelle-t'on les habitants de la ville de ${placeLabel}?`
    }
}

Quiz.Categories.Inception = class extends Quiz.Category {
    static wikidataID = "wdt:P571"

    static questionText(placeLabel)
    {
        return `En quelle année la ville de ${placeLabel} a-t'elle été fondée?`
    }
}

Quiz.Categories.Population = class extends Quiz.Category {
    static wikidataID = "wdt:P1082"

    static questionText(placeLabel)
    {
        return `Approximativement, combien d'habitants la ville de ${placeLabel} compte-t'elle?`
    }
}

export default Quiz
