export default {
    welcome: {
        title: "Ouvre Tes Yeux!",
        description:
            `Né de mon désir d'en connaître davantage sur le monde,
            Ouvre tes yeux! est un jeu éducatif se servant de votre géolocalisation
            pour poser des questions sur ce qui vous entoure.`,
        action: "Débuter!",
        notice: "Fait avec ❤️ par"
    },
    question: {
        next: "Prochain question",
        showAnswer: "Dévoiler"
    },
    answer: {
        bravo: "Bravo!",
        oops: "Oops!",
        neutral: "Réponse"
    },
    questions: {
        PointOfInterest: {
            Architect: `Quel est le nom de l'architecte à l'origine de cet établissement?`,
            DateOfOfficialOpening: `En quelle année est-ce que cet établissement a-t-il été ouvert au public pour la première fois?`
        },
        CityOrTown: {
            Area: `Approximativement, sur quelle superficie s'étend la ville de {{placeLabel}}?`,
            Demonym: `Comment appelle-t-on les habitants de la ville de {{placeLabel}}?`,
            Inception: `En quelle année la ville de {{placeLabel}} a-t-elle été fondée?`,
            Population: `Approximativement, combien d'habitants la ville de {{placeLabel}} compte-t'elle?`
        }
    }
}
