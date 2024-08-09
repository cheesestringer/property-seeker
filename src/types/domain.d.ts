interface SearchResponse {
  props: {
    listingSearchResultIds: number[];
  };
}

interface PropertyResponse {
  props: {
    id: number;
    listingSummary: ListingSummary;
    street: string;
    suburb: string;
    stateAbbreviation: string;
    postcode: string;
    footer: {
      suburb: {
        slug: string;
      };
    };
  };
}

interface ListingSummary {
  mode: string;
  beds: number;
  baths: number;
  parking: number;
  propertyType: string;
  status: string;
}
