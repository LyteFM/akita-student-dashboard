import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import {
  createStudent,
  Student,
  StudentQuery,
  StudentService
} from './state/index';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  formData: Student;
  students$: Observable<Array<Student>>;
  studentsGraphData$: Observable<{ [key: string]: Array<string | number> }>;

  constructor(
    private studentService: StudentService,
    public studentQuery: StudentQuery
  ) {}

  ngOnInit() {
    // - but currently, have way to many page changes: selectPage() and pageChanges() are both called 4 times!
    // - because getPage is called via student.service -> this.students$?
    // this is because EVERY subscription to an observable INVOKES it!
    // what I actually want is some event-like behaviour... with rxjs subjects and multicasting
    // „While plain Observables are unicast (each subscribed Observer owns an independent execution of
    // the Observable), Subjects are multicast.”

    // When not doing this, page changes used to not have effects since I didn't subscribe elsewhere.
    // but now I'm already doing that in 2 other locations here...
    // -> removing it reduced the calls of the method by 1.
    this.studentService.students$.subscribe((r) =>
      console.log('dashboard() - got: ', r)
    );

    // this.students$ = this.studentQuery.selectAll(); // before. but now just want current page.
    // In general, I'll want to use selectAll() with filters for computations (sanityCheck, Guide)
    // but subscribing to the pagination plugin for daily overview

    // this just calls `map`
    this.students$ = this.studentService.students$.pipe(
      map((r: any) => r.data)
    );
    this.studentsGraphData$ = this.students$.pipe(
      map(this.studentQuery.getStudentGraphData)
    );
  }

  onAdd() {
    this.nullifyFormData();
    setTimeout(() => (this.formData = createStudent({})));
  }
  onEdit(_id: ID) {
    this.nullifyFormData();
    setTimeout(() => (this.formData = this.studentQuery.getEntity(_id)));
  }

  onDelete(_id: ID) {
    this.nullifyFormData();
    if (confirm('Are you sure to delete?')) {
      this.studentService.deleteStudent(_id);
    }
  }

  updateformData(student: Student) {
    this.studentService.updateStudent(student);
    this.nullifyFormData();
  }

  nullifyFormData() {
    this.formData = null;
  }
}
