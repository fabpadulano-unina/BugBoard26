export enum IssueState {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum IssueType {
  QUESTION = 'QUESTION',
  BUG = 'BUG',
  DOCUMENTATION = 'DOCUMENTATION',
  FEATURE = 'FEATURE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  state: IssueState;
  type: IssueType;
  priority?: Priority;
  deadline?: string; 
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  createdAt: string;
}

export interface IssueRequest {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  deadline?: string; 
  assigneeId?: number;
}