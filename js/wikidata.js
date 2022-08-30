class Wikidata
{
  static fetch(query, format = "json")
  {
    let url = `https://query.wikidata.org/sparql?format=${format}&query=${encodeURIComponent(query)}`

    return fetch(url, { 'Accept': 'application/sparql-results+json' })
  }

  static query(queryString)
  {
    return this.fetch(queryString)
      .then((response) => response.json())
      .then((data) => data['results']['bindings'])
  }
}

export default Wikidata
