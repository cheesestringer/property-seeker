namespace Realcommerical {
  type TenurueType = 'vacant' | 'tenanted';

  type PropertyType = 'offices' | 'medical consulting';

  interface PropertyResponse {
    listing: {
      id: string;
      tenureType: TenurueType;
      propertyTypes: PropertyType[];
      address: {
        streetAddress: string;
        suburb: string;
        suburbAddress: string;
        state: string;
        postcode: string;
      };
      attributes: {
        id: string;
        label: string;
        value: string;
      }[];
      availableChannels: string[];
      daysActive: number;
      lastUpdatedAt: string;
    };
  }

  // There is only a daysActive field so to avoid multiple calculations of the actual date, modify the repsonse
  interface ModifiedPropertyResponse extends PropertyResponse {
    listedAt: string;
  }
}
