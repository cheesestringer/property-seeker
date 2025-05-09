export interface PropertyCache {
  timestamp: number;
  price: string;
  listedDate: string;
  updatedDate: string;
  hidden: boolean;

  propertyValue: string;
  propertyConfidence: string;
  propertyUrl: string;
  propertyTimestamp: number;

  walkScore: string;
  transportScore: string;
  walkScoreUrl: string;
  walkScoreTimestamp: number;

  lastViewCount: string;
}
