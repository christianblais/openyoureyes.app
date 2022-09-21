export default {
    menu: {
        clearHistory: "Clear history",
        viewSource: "View source",
    },
    welcome: {
        title: "Open Your Eyes!",
        description:
            `Born out of my desire to always know more about the world,
            Open Your Yes! is a fun educational game that uses your geolocation
            to ask questions about what's around.`,
        action: "Start!",
        notice: "Built with ❤️ by"
    },
    question: {
        next: "Next question",
        showAnswer: "Tell me!"
    },
    answer: {
        bravo: "Bravo!",
        oops: "Oops!",
        neutral: "Answer"
    },
    questions: {
        PointOfInterest: {
            Architect: `What is the name of the architect behind this building?`,
            DateOfOfficialOpening: `What year did this building opened its doors for the first time to the public?`
        },
        CityOrTown: {
            Area: `Approximately, over what area does the city of {{placeLabel}} extend?`,
            Demonym: `How do you name people who live in {{placeLabel}}?`,
            Inception: `In what year was the city of {{placeLabel}} founded?`,
            Population: `Approximately how many inhabitants does the city of {{placeLabel}} have?`
        },
        Mountain: {
            MadeFromMaterial: `What material is this mountain mainly made of?`,
            Elevation: `Approximately, how high is this mountain?`,
            MountainRange: `What mountain range is this mountain part of?`,
        }
    }
}
