import Wikidata from './wikidata.js'

class Quiz
{
    static Categories = {}

    static getCurrentPosition()
    {
        return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }

    static formatField(wikidataBinding)
    {
      switch(wikidataBinding['datatype'])
      {
        case "http://www.w3.org/2001/XMLSchema#dateTime":
          return new Date(wikidataBinding['value']).toLocaleDateString()
        default:
          return wikidataBinding['value']
      }
    }

    static format(wikidataBindings)
    {
        return wikidataBindings
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
            .then((response) => this.constructor.format(response))
    }
}

Quiz.Categories.Area = class {
    static getQueryString(lat, lon) {
        return `
            SELECT DISTINCT
                ?placeLabel
                ?distance
                (SAMPLE(?area) as ?area)
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place wdt:P31 wd:Q27676416 .
                ?place wdt:P2046 ?area .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?placeLabel ?distance
            ORDER BY ?distance LIMIT 1
        `
    }
}

Quiz.Categories.Demonym = class {
    static getQueryString(lat, lon) {
        return `
            SELECT DISTINCT
                ?placeLabel
                ?distance
                (SAMPLE(?demonym) as ?demonym)
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place wdt:P31 wd:Q27676416 .
                ?place wdt:P1549 ?demonym .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?placeLabel ?distance
            ORDER BY ?distance LIMIT 1
        `
    }
}

Quiz.Categories.Inception = class {
    static getQueryString(lat, lon) {
        return `
            SELECT DISTINCT
                ?placeLabel
                ?distance
                (SAMPLE(?inception) as ?inception)
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place wdt:P31 wd:Q27676416 .
                ?place wdt:P571 ?inception .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?placeLabel ?distance
            ORDER BY ?distance LIMIT 1
        `
    }
}

Quiz.Categories.Population = class {
    static getQueryString(lat, lon) {
        return `
            SELECT DISTINCT
                ?placeLabel
                ?distance
                (SAMPLE(?population) as ?population)
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place wdt:P31 wd:Q27676416 .
                ?place wdt:P1082 ?population .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?placeLabel ?distance
            ORDER BY ?distance LIMIT 1
        `
    }
}

export default Quiz
