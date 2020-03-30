import { guid } from '@datorama/akita';

export interface Student {
  _id: string;
  _rev?: string;
  name: string;
  sex: 'Male' | 'Female';
  standard: number;
  quarterlyScore: number;
  halfyearlyScore: number;
  annualScore: number;
}

export function createStudent({
  name = '',
  standard = null,
  sex = null,
  quarterlyScore = 0,
  halfyearlyScore = 0,
  annualScore = 0
}: Partial<Student>) {
  return {
    _id: guid(),
    name,
    sex,
    standard,
    quarterlyScore,
    halfyearlyScore,
    annualScore
  } as Student;
}
