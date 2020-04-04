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
        startWith: START_PAGE,
        preloadRange: 2
      },
      (d, step) =>
        formatISO(addDays(parseISO(<string>d), step), {
          representation: 'date'
        }),
      (d, step) =>
        formatISO(subDays(parseISO(<string>d), step), {
          representation: 'date'
        })
    );
  }
});
