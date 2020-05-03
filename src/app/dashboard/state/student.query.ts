import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { Student } from './student.model';
import { StudentState, StudentStore } from './student.store';

@Injectable({ providedIn: 'root' })
@QueryConfig({
  sortBy: '_id',
  sortByOrder: Order.ASC
})
export class StudentQuery extends QueryEntity<StudentState> {
  constructor(protected store: StudentStore) {
    super(store);
  }

  getStudentGraphData(
    students: Array<Student>
  ): { [key: string]: Array<string | number> } {
    return students.reduce(
      (
        {
          names: newArray,
          quarterly: qArray,
          halfyearly: hArray,
          annual: aArray
        },
        { name, quarterlyScore, halfyearlyScore, annualScore }
      ) => {
        return {
          names: [...newArray, name],
          quarterly: [...qArray, quarterlyScore],
          halfyearly: [...hArray, halfyearlyScore],
          annual: [...aArray, annualScore]
        };
      },
      { names: [], quarterly: [], halfyearly: [], annual: [] }
    );
  }
}
