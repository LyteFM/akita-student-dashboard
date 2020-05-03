import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Student } from './student.model';
import { guid } from '@datorama/akita';
import PouchDB from 'pouchdb';
import { parseISO, startOfDay, endOfDay, formatISO } from 'date-fns';

const students: Array<Student> = [
  {
    _id: `2011-10-05T14:48:00Z_${guid()}`,
    added: '2011-10-05T14:48:00Z',
    name: 'Mohan Ram',
    sex: 'Male',
    standard: 12,
    quarterlyScore: 80,
    halfyearlyScore: 76,
    annualScore: 89
  },
  {
    _id: `2011-10-01T14:48:00Z_${guid()}`,
    added: '2011-10-01T14:48:00Z',
    name: 'Sowmiya',
    sex: 'Female',
    standard: 11,
    quarterlyScore: 90,
    halfyearlyScore: 94,
    annualScore: 97
  },
  {
    _id: `2011-10-01T12:48:00Z_${guid()}`,
    added: '2011-10-01T12:48:00Z',
    name: 'Suresh',
    sex: 'Male',
    standard: 8,
    quarterlyScore: 56,
    halfyearlyScore: 54,
    annualScore: 58
  },
  {
    _id: `2011-10-02T10:48:00Z_${guid()}`,
    added: '2011-10-02T10:48:00Z',
    name: 'Rithika',
    sex: 'Female',
    standard: 4,
    quarterlyScore: 87,
    halfyearlyScore: 67,
    annualScore: 78
  },
  {
    _id: `2011-10-04T10:55:00Z_${guid()}`,
    added: '2011-10-04T10:55:00Z',
    name: 'Bernie',
    sex: 'Male',
    standard: 4,
    quarterlyScore: 87,
    halfyearlyScore: 67,
    annualScore: 78
  },
  {
    _id: `2011-10-04T18:55:00Z_${guid()}`,
    added: '2011-10-04T18:55:00Z',
    name: 'Jessica',
    sex: 'Female',
    standard: 4,
    quarterlyScore: 97,
    halfyearlyScore: 67,
    annualScore: 85
  },
  {
    _id: `2011-10-05T19:48:00Z_${guid()}`,
    added: '2011-10-05T19:48:00Z',
    name: 'Karl',
    sex: 'Male',
    standard: 9,
    quarterlyScore: 85,
    halfyearlyScore: 56,
    annualScore: 70
  }
];

@Injectable({
  providedIn: 'root'
})
export class StudentDataService {
  db: PouchDB.Database;
  constructor() {
    this.db = new PouchDB('students');
    this.db
      .info()
      .then((info) => {
        if (info.doc_count) {
          return Promise.resolve();
        } else {
          console.log('seeding student data');
          this.db.bulkDocs(students);
        }
      })
      .then(() => console.log('Pouch initialised.'));
  }

  get(dateStr: string): Observable<Array<Student>> {
    console.log('get() - with dateStr: ', dateStr);

    const start = formatISO(startOfDay(parseISO(dateStr)));
    const end = formatISO(endOfDay(parseISO(dateStr)));

    return from(
      this.db
        .allDocs({ include_docs: true, startkey: start, endkey: end })
        .then((resp) =>
          resp.rows.map((row) => row.doc).map((doc) => doc as Student)
        )
        .then((res) => {
          console.log('get() - got res:', res);
          return res;
        })
    );
  }

  /**
   * I could either implement something like this OR just always load the whole DB
   * into the store...
   * - findAllItemsOfType -> sensor, via `type`.
   * - findTaskItems -> all or single items for `guideRunId`
   * This approach with a map isn't very smart... better just use the store!!!
   *  */
  find(query: any) {
    return this.db.find(query).then((res) => {
      return res.docs as Student[];
    });
  }

  upsert(student: Student) {
    return this.db.put(student);
  }

  delete(student: Partial<Student>) {
    return this.db.remove(student._id, student._rev);
  }
}
