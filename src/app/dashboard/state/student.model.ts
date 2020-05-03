import { guid } from '@datorama/akita';
import { formatISO } from 'date-fns';

export interface Student {
  _id: string;
  _rev?: string;
  added: string;
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
  const now = formatISO(new Date());
  console.log('createStudent() - now: ', now);
  return {
    _id: `${now}_${guid()}`,
    name,
    added: now,
    sex,
    standard,
    quarterlyScore,
    halfyearlyScore,
    annualScore
  } as Student;
}
