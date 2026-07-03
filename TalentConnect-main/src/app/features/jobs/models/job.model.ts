/**
 * Job Model - Offre d'emploi
 */

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary?: number;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  requirements: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface CreateJobDTO {
  title: string;
  description: string;
  department: string;
  location: string;
  type: JobType;
  salary?: number;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  requirements: string[];
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {
  status?: JobStatus;
}

export interface JobFilter {
  search?: string;
  department?: string;
  location?: string;
  type?: JobType;
  status?: JobStatus;
  page?: number;
  pageSize?: number;
}
