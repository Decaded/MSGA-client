export interface Work {
  id: string;
  title: string;
  status: WorkStatus;
  url: string;
  reporter?: string;
  dateReported?: string;
  reason?: string;

  approved: boolean;
  proofs: string[];
  additionalInfo: string;
}

export type WorkStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'taken_down'
  | 'in_progress'
  | 'confirmed'
  | 'taken_down'
  | 'original';
