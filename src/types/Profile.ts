export interface Profile {
  id: number;
  title: string;
  status: ProfileStatus;
  url: string;
  reporter?: string;
  dateReported?: string;
  reason?: string;

  approved: boolean;
  proofs: string[];
  additionalInfo: string;

  lastUpdated?: string;
  updatedBy?: string;
}

export type ProfileStatus =
  | 'pending_review'
  | 'in_progress'
  | 'confirmed_violator'
  | 'false_positive'
