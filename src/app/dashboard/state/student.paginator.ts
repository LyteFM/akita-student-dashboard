import { addDays, formatISO, parseISO, subDays } from 'date-fns';
import { CustomPaginatorPlugin } from 'src/app/paginator/customPaginator';

import { inject, InjectionToken } from '@angular/core';

import { StudentQuery } from './student.query';

export const START_PAGE = '2011-10-03';

export const STUDENT_PAGINATOR = new InjectionToken('STUDENT_PAGINATOR', {
  providedIn: 'root',
  factory: () => {
    const studentsQuery = inject(StudentQuery);
    return new CustomPaginatorPlugin(
      studentsQuery,
      {
        defaultPage: START_PAGE,
        startWith: START_PAGE
      },
      (d) =>
        formatISO(addDays(parseISO(<string>d), 1), { representation: 'date' }),
      (d) =>
        formatISO(subDays(parseISO(<string>d), 1), { representation: 'date' })
    );
  }
});
