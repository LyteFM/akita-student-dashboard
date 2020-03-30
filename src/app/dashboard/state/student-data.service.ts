import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Student } from './student.model';
import { guid } from '@datorama/akita';
import PouchDB from 'pouchdb';
import { filter } from 'rxjs/operators';

const students: Array<Student> = [
  {
    _id: guid(),
    name: 'Mohan Ram',
    sex: 'Male',
    standard: 12,
    quarterlyScore: 80,
    halfyearlyScore: 76,
    annualScore: 89
  },
  {
    _id: guid(),
    name: 'Sowmiya',
    sex: 'Female',
    standard: 11,
    quarterlyScore: 90,
    halfyearlyScore: 94,
    annualScore: 97
  },
  {
    _id: guid(),
    name: 'Suresh',
    sex: 'Male',
    standard: 8,
    quarterlyScore: 56,
    halfyearlyScore: 54,
    annualScore: 58
  },
  {
    _id: guid(),
    name: 'Rithika',
    sex: 'Female',
    standard: 4,
    quarterlyScore: 87,
    halfyearlyScore: 67,
    annualScore: 78
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

  get(): Observable<Array<Student>> {
    return from(
      this.db
        .allDocs({ include_docs: true })
        .then((resp) =>
          resp.rows.map((row) => row.doc).map((doc) => doc as Student)
        )
        .then((res) => {
          console.log('got res:', res);
          return res;
        })
    );
  }

  upsert(student: Student) {
    return this.db.put(student);
  }

  delete(student: Partial<Student>) {
    return this.db.remove(student._id, student._rev);
  }
}
