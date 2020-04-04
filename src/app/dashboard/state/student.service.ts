import { Injectable, OnInit, Inject } from '@angular/core';
import { ID, StateHistoryPlugin, PaginationResponse } from '@datorama/akita';
import { StudentStore, StudentState } from './student.store';
import { Student } from './student.model';
import { switchMap, map, multicast } from 'rxjs/operators';
import { StudentDataService } from './student-data.service';
import { StudentQuery } from './student.query';
import { BehaviorSubject } from 'rxjs';
import {
  CustomPaginationResponse,
  CustomPaginatorPlugin
} from 'src/app/paginator/customPaginator';
import { STUDENT_PAGINATOR } from './student.paginator';

@Injectable({ providedIn: 'root' })
export class StudentService {
  stateHistory: StateHistoryPlugin<StudentState>;
  students$: any;
  subject: BehaviorSubject<CustomPaginationResponse<Student>>;

  constructor(
    private studentStore: StudentStore,
    private studentDataService: StudentDataService,
    private studentQuery: StudentQuery,
    @Inject(STUDENT_PAGINATOR)
    private paginatorRef: CustomPaginatorPlugin<Student>
  ) {
    this.stateHistory = new StateHistoryPlugin(this.studentQuery);
    const subject$ = new BehaviorSubject<CustomPaginationResponse<Student>>({
      currentPage: '',
      data: []
    });
    this.students$ = this.paginatorRef.pageChanges.pipe(
      switchMap((page) => {
        console.log('pageChanges() - page: ', page);
        const requestFn = (page) => this.getStudentsForDate(<string>page);
        return this.paginatorRef.getPage(requestFn);
      }),
      multicast(subject$)
    );
    this.students$.connect();
  }

  getStudentsForDate(dateStr: string) {
    return this.studentDataService.get(dateStr).pipe(
      map((data) => {
        return <CustomPaginationResponse<Student>>{
          currentPage: dateStr,
          data: data
        };
      })
    );
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
