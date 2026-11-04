export type UpdateComplaintPayload = {
  title: string;
  description: string;
  location: string;
  building: string;
  priority: "low" | "medium" | "high" | "urgent";
  categorySlug: string;
};

export type EditableComplaint = {
  id: number;
  title: string;
  description?: string;
  location?: string;
  building?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: string;
  category?: {
    id?: number;
    name?: string;
    slug?: string;
  };
};