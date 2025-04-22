interface SuggestionResponse {
  _embedded: {
    suggestions: Suggestion[];
  };
}

interface Suggestion {
  id: string;
  source: {
    url: string;
    state: string;
    suburb: string;
    postcode: string;
    streetName: string;
    streetNumber: string;
    streetNumberFrom: string;
    streetNumberTo: string;
  };
}
