

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: Date;
  uploaded_by: string;
  shared: boolean;
  url?: string;
}

