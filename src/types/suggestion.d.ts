interface SuggestionResponse {
  _embedded: {
    suggestions: Suggestion[];
  };
}

interface Suggestion {
  source: {
    url: string;
  }
}