import { Injectable, OnInit } from '@angular/core';
import { ID, StateHistoryPlugin } from '@datorama/akita';
import { StudentStore, StudentState } from './student.store';
import { Student } from './student.model';
import { tap } from 'rxjs/operators';
import { StudentDataService } from './student-data.service';
import { StudentQuery } from './student.query';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  stateHistory: StateHistoryPlugin<StudentState>;
  constructor(
    private studentStore: StudentStore,
    private studentDataService: StudentDataService,
    private studentQuery: StudentQuery
  ) {
    this.stateHistory = new StateHistoryPlugin(this.studentQuery);
  }

  getStudents(): Observable<Array<Student>> {
    if (!this.studentQuery.getHasCache()) {
      console.log('getStudents() - from db');
      return this.studentDataService.get().pipe(
        tap((s) => {
          console.log('getStudents() - loaded', s);
          this.studentStore.set(s);
        })
      );
    } else {
      console.log('getStudents() - from cache');
      return of();
    }
  }

  updateStudent(student: Student) {
    this.studentStore.upsert(student._id, student);
    this.studentDataService.upsert(student).catch((err) => {
      console.error(err);
      alert(`Could not update student ${student.name}, reverting...`);
      // @ts-ignore
      this.stateHistory.undo(student._id);
    });
  }

  deleteStudent(_id: ID) {
    const student = this.studentQuery.getEntity(_id);
    this.studentStore.remove(_id);
    this.studentDataService.delete(student).catch((err) => {
      console.error(err);
      alert(`Could not save student ${student.name}, reverting...`);
      if (this.stateHistory.hasPast) {
        // @ts-ignore
        this.stateHistory.undo(studient._id);
      }
    });
  }
}
