import Wikidata from './wikidata.js'

class Quiz
{
    static Questions = {}

    static hydrate(data)
    {
        if (!data)
            return null;

        Object.entries(data).forEach(([category, questions]) => {
            this.Questions[category].memoryStore = questions
        })
    }

    static serialize()
    {
        return Object.entries(this.Questions).reduce((data, [name, category]) => {
            data[name] = category.memoryStore; return data
        }, {})
    }

    static getCurrentPosition()
    {
        return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }

    static parseField(wikidataBinding)
    {
        if (wikidataBinding['datatype'] == "http://www.w3.org/2001/XMLSchema#dateTime")
            return new Date(wikidataBinding['value']).toLocaleDateString()

        if (wikidataBinding['datatype'] == "http://www.w3.org/2001/XMLSchema#decimal")
            return parseFloat(wikidataBinding['value'])

        if (wikidataBinding['value'].startsWith("http://www.wikidata.org/entity/"))
            return `wd:${wikidataBinding['value'].split('/').slice(-1)}`
            
        return wikidataBinding['value']
    }

    static parse(wikidataBindings)
    {
        return Object.entries(wikidataBindings).reduce((entries, entry) => {
            entries[entry[0]] = this.parseField(entry[1]); return entries
        }, {})
    }

    static question()
    {
        return this.questionInCategories(Object.values(Quiz.Questions))
    }

    static async questionInCategories(categories)
    {
        let category = categories[Math.floor(Math.random() * categories.length)]

        let question = await this.getCurrentPosition()
            .then((geolocation) => geolocation.coords)
            .then(({latitude, longitude}) => category.getQueryString(latitude, longitude))
            .then((queryString) => Wikidata.query(queryString))
            .then((results) => results[0])
            .then((response) => this.parse(response))
            .then((parsedResponse) => new category(parsedResponse))
            .catch(() => {
                return this.questionInCategories(categories.filter((x) => x !== category))
            })
        
        category.memorizeQuestion(question)

        return question
    }
}

class Question {
    constructor(entry)
    {
        this.id = entry['place']
        this.place = entry['placeLabel']
        this.question = this.constructor.questionText(entry['placeLabel'])
        this.category = this.constructor.category
        this.answer = this.constructor.answerText(entry['valueLabel'])
        this.choices = this.constructor.choices(entry['valueLabel'])
        this.distance = parseFloat(entry['distance'])
        this.latitude = parseFloat(entry['latitude'])
        this.longitude =  parseFloat(entry['longitude'])
    }

    static memorizeQuestion(question)
    {
        this.memoryStore.push(question.id)
    }

    static getQueryString(lat, lon)
    {
        return `
            SELECT DISTINCT
                ?place
                ?placeLabel
                ?distance
                ?longitude
                ?latitude
                ?valueLabel
            WHERE
            {
                SERVICE wikibase:around {
                    ?place wdt:P625 ?location .
                    bd:serviceParam wikibase:center "Point(${lon},${lat})"^^geo:wktLiteral .
                    bd:serviceParam wikibase:radius "100" .
                    bd:serviceParam wikibase:distance ?distance .
                } .

                ?place ${this.wikidataInheritanceType == 'strict' ? 'wdt:P31' : 'wdt:P31/wdt:P279*'} ${this.wikidataTypeId} .
                ?place p:P625 [ psv:P625 [ wikibase:geoLongitude ?longitude ; wikibase:geoLatitude ?latitude ] ] .
                ?place ${this.wikidataID} ?value .

                FILTER ( ?place not in ( ${this.memoryStore.join(', ')} ) ) .

                SERVICE wikibase:label { bd:serviceParam wikibase:language "fr" . }
            }
            GROUP BY ?place ?placeLabel ?distance ?longitude ?latitude ?valueLabel
            ORDER BY ?distance LIMIT 1
        `
    }
}

Question.CityOrTown = class extends Question {
    static wikidataInheritanceType = 'strict'
    static wikidataTypeId = "wd:Q27676416"
}

Question.PointOfInterest = class extends Question {
    static wikidataInheritanceType = 'lax'
    static wikidataTypeId = "wd:Q960648"
}

Quiz.Questions['PointOfInterest.Architect'] = class extends Question.PointOfInterest {
    static memoryStore = []
    static wikidataID = "wdt:P84"
    static category = "Architectes"

    static questionText(placeLabel)
    {
        return `Quel est le nom de l'architecte à l'origine du ${placeLabel}?`
    }

    static answerText(answer)
    {
        return answer
    }

    static choices(answer)
    {
        return []
    }
}

Quiz.Questions['PointOfInterest.DateOfOfficialOpening'] = class extends Question.PointOfInterest {
    static memoryStore = []
    static wikidataID = "wdt:P1619"
    static category = "Histoire"

    static questionText(placeLabel)
    {
        return `En quelle année est-ce que le ${placeLabel} a-t-il été ouvert au public pour la première fois?`
    }

    static answerText(answer)
    {
        return new Date(answer).getFullYear()
    }

    static choices(answer)
    {
        let year = this.answerText(answer)

        switch (Math.floor(Math.random() * 3))
        {
            case 0:
                return [year - 20, year - 10, year]
            case 1:
                return [year - 10, year, year + 10]
            case 2:
                return [year, year + 10, year + 20]
        }
    }
}

Quiz.Questions['CityOrTown.Area'] = class extends Question.CityOrTown {
    static memoryStore = []
    static wikidataID = "wdt:P2046"
    static category = "Géographie"

    static questionText(placeLabel)
    {
        return `Approximativement, sur quelle superficie s'étend la ville de ${placeLabel}?`
    }

    static answerText(answer)
    {
        return `${Math.round(answer)} km²`
    }

    static choices(answer)
    {
        let choices;

        switch (Math.floor(Math.random() * 3))
        {
            case 0:
                choices = [answer * 0.6, answer * 0.8, answer]; break
            case 1:
                choices = [answer * 0.8, answer, answer * 1.2]; break
            case 2:
                choices = [answer, answer * 1.2, answer * 1.4]; break
        }

        return choices.map((choice) => this.answerText(choice))
    }
}

Quiz.Questions['CityOrTown.Demonym'] = class extends Question.CityOrTown {
    static memoryStore = []
    static wikidataID = "wdt:P1549"
    static category = "Gentilés"

    static questionText(placeLabel)
    {
        return `Comment appelle-t-on les habitants de la ville de ${placeLabel}?`
    }

    static answerText(answer)
    {
        return answer
    }

    static choices(answer)
    {
        return []
    }
}

Quiz.Questions['CityOrTown.Inception'] = class extends Question.CityOrTown {
    static memoryStore = []
    static wikidataID = "wdt:P571"
    static category = "Histoire"

    static questionText(placeLabel)
    {
        return `En quelle année la ville de ${placeLabel} a-t-elle été fondée?`
    }

    static answerText(answer)
    {
        return new Date(answer).getFullYear()
    }

    static choices(answer)
    {
        let year = this.answerText(answer)

        switch (Math.floor(Math.random() * 3))
        {
            case 0:
                return [year - 20, year - 10, year]
            case 1:
                return [year - 10, year, year + 10]
            case 2:
                return [year, year + 10, year + 20]
        }
    }
}

Quiz.Questions['CityOrTown.Population'] = class extends Question.CityOrTown {
    static memoryStore = []
    static wikidataID = "wdt:P1082"
    static category = "Population"

    static questionText(placeLabel)
    {
        return `Approximativement, combien d'habitants la ville de ${placeLabel} compte-t'elle?`
    }

    static answerText(answer)
    {
        return (Math.round(answer / 1000) * 1000).toLocaleString()
    }

    static choices(answer)
    {
        let choices;

        switch (Math.floor(Math.random() * 3))
        {
            case 0:
                choices = [answer * 0.6, answer * 0.8, answer]; break
            case 1:
                choices = [answer * 0.8, answer, answer * 1.2]; break
            case 2:
                choices = [answer, answer * 1.2, answer * 1.4]; break
        }

        return choices.map((choice) => this.answerText(choice))
    }
}

export default Quiz
