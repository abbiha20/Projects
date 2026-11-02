export interface TaskQueryOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  assignedToId?: string;
  contactId?: string;
}
