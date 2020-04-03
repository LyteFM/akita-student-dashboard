// How to I want to access data?
// a) by startKey and endKey. This would be very nice and general, but it would be  difficult
//    to determine whether a given interval has already been called; Especially if allowing for
//    more than interval to be cached. Nice: could work with both ints and strings.
// b) with a single key (e.g. YYYY-MM-DD) and treat the actual request as implementation detail.
//    easier to get started with, could pass a `request_builder` as function.

// todo: add pre-fetch logic!

import { BehaviorSubject, from, isObservable, Observable, Subscription } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';

import {
    action, AkitaPlugin, applyTransaction, EntityState, getEntityType, ID, isNil, isUndefined, logAction, QueryEntity
} from '@datorama/akita';

export interface CustomPaginationResponse<E> {
  /** the identifier of the current page, not necessarily a number */
  currentPage: ID;
  data: E[];

  /** these are only available if using numbers? */
  lastPage?: ID;
  from?: ID;
  to?: ID;
  pageControls?: ID[];
  total?: number;
}

export type CustomPaginatorConfig = {
  defaultPage: ID;
  pagesControls?: boolean;
  range?: boolean;
  startWith?: ID;
  cacheTimeout?: Observable<number>;
  clearStoreWithCache?: boolean;
};

const paginatorDefaults: CustomPaginatorConfig = {
  defaultPage: 1,
  pagesControls: false,
  range: false,
  startWith: 1,
  cacheTimeout: undefined,
  clearStoreWithCache: true
};

export class CustomPaginatorPlugin<
  State extends EntityState
> extends AkitaPlugin<State> {
  /** Save current filters, sorting, etc. in cache */
  metadata = new Map();

  private page: BehaviorSubject<ID>;
  private pages = new Map<ID, { ids: ID[] }>();
  private readonly clearCacheSubscription: Subscription;

  private pagination: CustomPaginationResponse<getEntityType<State>>;

  /**
   * When the user navigates to a different page and return
   * we don't want to call `clearCache` on first time.
   */
  private initial = true;

  constructor(
    protected query: QueryEntity<State>,
    public config: CustomPaginatorConfig,
    private forward: (cur: ID) => ID = (cur) => <number>cur + 1,
    private backward: (cur: ID) => ID = (cur) => <number>cur - 1
  ) {
    super(query, {
      resetFn: () => {
        this.initial = false;
        this.destroy({ clearCache: true, currentPage: config.defaultPage });
      }
    });

    this.pagination = {
      currentPage: config.defaultPage,
      //lastPage: typeof config.defaultPage === 'string' ? '' : 0,
      data: []
    };
    this.config = { ...paginatorDefaults, ...config };
    console.log('CustomPaginator() - config now: ', this.config);
    this.page = new BehaviorSubject(this.config.startWith);
    if (isObservable(this.config.cacheTimeout)) {
      this.clearCacheSubscription = this.config.cacheTimeout.subscribe(() =>
        this.clearCache()
      );
    }
  }

  /**
   * Proxy to the query loading
   */
  isLoading$ = this.query.selectLoading().pipe(delay(0));

  /**
   * Listen to page changes
   */
  get pageChanges() {
    return this.page.asObservable();
  }

  /**
   * Get the current page number
   */
  get currentPage() {
    return this.pagination.currentPage;
  }

  /**
   * Set the loading state
   */
  setLoading(value = true) {
    this.getStore().setLoading(value);
  }

  /**
   * Update the pagination object and add the page
   */
  @action('@CustomPagination - New Page')
  update(response: CustomPaginationResponse<getEntityType<State>>) {
    this.pagination = response;
    this.addPage(response.data);
  }

  /**
   * Set the ids and add the page to store
   */
  addPage(data: getEntityType<State>[]) {
    this.pages.set(this.currentPage, {
      ids: data.map((entity) => entity[this.getStore().idKey])
    });
    this.getStore().add(data);
  }

  /**
   * Clear the cache.
   */
  clearCache(options: { clearStore?: boolean } = {}) {
    if (!this.initial) {
      logAction('@CustomPagination - Clear Cache');

      if (
        options.clearStore !== false &&
        (this.config.clearStoreWithCache || options.clearStore)
      ) {
        this.getStore().remove();
        console.log('clearCache() - also cleared the store!');
      }

      this.pages = new Map();
      this.metadata = new Map();
    }
    this.initial = false;
  }

  clearPage(page: ID) {
    this.pages.delete(page);
  }

  /**
   * Clear the cache timeout and optionally the pages
   */
  destroy({
    clearCache,
    currentPage
  }: { clearCache?: boolean; currentPage?: ID } = {}) {
    if (this.clearCacheSubscription) {
      this.clearCacheSubscription.unsubscribe();
    }
    if (clearCache) {
      this.clearCache();
    }
    if (!isUndefined(currentPage)) {
      this.setPage(currentPage);
    }
    this.initial = true;
  }

  /**
   * Whether the provided page is active
   */
  isPageActive(page: ID) {
    return this.currentPage === page;
  }

  /**
   * Set the current page
   */
  setPage(page: ID) {
    if (page !== this.currentPage || !this.hasPage(page)) {
      this.page.next((this.pagination.currentPage = page));
    }
  }

  /**
   * Increment current page
   */
  nextPage() {
    this.setPage(this.forward(this.pagination.currentPage));
  }

  /**
   * Decrement current page
   */
  prevPage() {
    this.setPage(this.backward(this.pagination.currentPage));
  }

  /**
   * Check if page exists in cache
   */
  hasPage(page: ID) {
    return this.pages.has(page);
  }

  /**
   * Get the current page if it's in cache, otherwise invoke the request
   */
  getPage(
    req: () => Observable<CustomPaginationResponse<getEntityType<State>>>
  ) {
    let page = this.pagination.currentPage;
    if (this.hasPage(page)) {
      return this.selectPage(page);
    } else {
      this.setLoading(true);
      console.log('customPaginator.getPage() - for page: ', page);
      return from(req()).pipe(
        switchMap((config: CustomPaginationResponse<getEntityType<State>>) => {
          page = config.currentPage;
          applyTransaction(() => {
            this.setLoading(false);
            this.update(config);
          });
          return this.selectPage(page);
        })
      );
    }
  }

  getQuery(): QueryEntity<State> {
    return this.query;
  }

  refreshCurrentPage() {
    if (isNil(this.currentPage) === false) {
      this.clearPage(this.currentPage);
      this.setPage(this.currentPage);
    }
  }

  /**
   * todo: this won't work... need to check where used...does it make sense to use startWith???
   * should retrieve this from the current array...
   */
  /*
  private getFrom() {
    if (this.isFirst) {
      return 1;
    }
    return (this.currentPage - 1) * this.pagination.perPage + 1;
  }

  private getTo() {
    if (this.isLast) {
      return this.pagination.total;
    }
    return this.currentPage * this.pagination.perPage;
  }
  */

  /**
   * Select the page
   */
  private selectPage(
    page: ID
  ): Observable<CustomPaginationResponse<getEntityType<State>>> {
    return this.query.selectAll({ asObject: true }).pipe(
      take(1),
      map((entities) => {
        let response: CustomPaginationResponse<getEntityType<State>> = {
          ...this.pagination,
          data: this.pages.get(page).ids.map((id) => entities[id])
        };

        console.log('selectPage() - got response: ', response);

        /*
        const { range, pagesControls } = this.config;

        //If no total - calc it.
        if (isNaN(this.pagination.total)) {
          if (response.lastPage === 1) {
            response.total = response.data ? response.data.length : 0;
          } else {
            response.total = response.perPage * response.lastPage;
          }
          this.pagination.total = response.total;
        }

        if (range) {
          response.from = this.getFrom();
          response.to = this.getTo();
        }

        if (pagesControls) {
          response.pageControls = generatePages(
            this.pagination.total,
            this.pagination.perPage
          );
        }
        */

        return response;
      })
    );
  }
}
