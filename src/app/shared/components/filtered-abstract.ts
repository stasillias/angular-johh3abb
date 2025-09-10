import { DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { distinctUntilChanged, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, retry, switchMap, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';

import { ControlsOf } from '../models/controls-of';

@Directive()
export abstract class FilteredAbstract<
  D,
  F extends Record<string, unknown> = Record<string, never>,
  T extends Record<string, unknown> = Record<string, never>,
> implements OnInit
{
  protected filterFormGroup: FormGroup<ControlsOf<F>>;
  private readonly dataUpdateRequested$ = new Subject<void>();

  protected readonly isLoading = signal<boolean>(false);
  protected readonly data = signal<D>(null);

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected createFilters(): FormGroup<ControlsOf<F>> {
    return new FormGroup<ControlsOf<F>>({} as ControlsOf<F>);
  }

  protected abstract loadData(): Observable<D>;

  protected abstract getQueryParamsFromFilterData(): T;

  protected abstract setFilterValuesFromUrl(params: ParamMap): void;

  ngOnInit(): void {
    this.filterFormGroup = this.createFilters();

    this.subscribeToDataUpdateRequest();
    this.subscribeToFormValues();
    this.subscribeToQueryParams();

    // перше завантаження даних
    this.dataUpdateRequested$.next(void 0);
  }

  protected updateUrlWithFilterData(): void {
    const queryParams = this.getQueryParamsFromFilterData();
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private subscribeToDataUpdateRequest(): void {
    this.dataUpdateRequested$
      .asObservable()
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap(() => this.loadData()),
        catchError((error) => {
          this.isLoading.set(false);
          return throwError(() => error);
        }),
        tap(() => this.isLoading.set(false)),
        retry(3),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.data.set(data));
  }

  private subscribeToFormValues(): void {
    this.filterFormGroup.valueChanges
      .pipe(
        filter(() => this.filterFormGroup.valid),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap(() => this.updateUrlWithFilterData()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.dataUpdateRequested$.next(void 0));
  }

  private subscribeToQueryParams(): void {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => this.setFilterValuesFromUrl(params));
  }
}
