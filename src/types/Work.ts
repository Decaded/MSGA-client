export interface Work {
  id: number;
  title: string;
  status: WorkStatus;
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

export type WorkStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'taken_down'
  | 'in_progress'
  | 'confirmed'
  | 'original';
