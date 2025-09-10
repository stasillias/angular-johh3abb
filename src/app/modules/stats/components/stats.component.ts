import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import {
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { delay, Observable, of } from 'rxjs';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';

import { ControlsOf } from '../../../shared/models/controls-of';
import { ReplaceDatesWithStrings } from '../../../shared/models/replace-dates-with-strings';
import { ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataValidationService } from '../../../shared/services/data-validation.service';

type StatsModel = {};

type StatsFiltersModel = Partial<{
  dateFrom: Date;
  dateTo: Date;
  compareDateFrom: Date;
  compareDateTo: Date;
}>;

type StatsFiltersQueryParamsModel = ReplaceDatesWithStrings<StatsFiltersModel>;

@Component({
  selector: 'stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatNativeDateModule,
    MatProgressBarModule,
    UiToggleGroupSingleDirective,
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent
  extends FilteredAbstractComponent<StatsModel[], StatsFiltersModel, StatsFiltersQueryParamsModel>
  implements OnInit
{
  protected isCompareMode = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);
  private readonly datesService = inject(DataValidationService);

  ngOnInit() {
    super.ngOnInit();
    this.updateUrlWithFilterData();
  }

  protected createFilters(): FormGroup<ControlsOf<StatsFiltersModel>> {
    this.isCompareMode.set(
      this.datesService.isValidDateString(this.activatedRoute.snapshot.queryParamMap.get('compareDateFrom')),
    );
    const { dateFrom, dateTo, compareDateFrom, compareDateTo } = this.getDateValuesFromUrl();
    // дефолтні значення для фільтрів
    const today = new Date();
    return this.fb.group<ControlsOf<StatsFiltersModel>>({
      dateFrom: this.fb.control<Date>(dateFrom || this.getDefaultDateFrom(), Validators.required),
      dateTo: this.fb.control<Date>(dateTo || today, Validators.required),
      compareDateFrom: this.fb.control<Date>(
        { value: compareDateFrom, disabled: !this.isCompareMode() },
        Validators.required,
      ),
      compareDateTo: this.fb.control<Date>(
        { value: compareDateTo, disabled: !this.isCompareMode() },
        Validators.required,
      ),
    });
  }

  protected toggleCompare(): void {
    if (this.filterFormGroup.get('compareDateFrom').enabled) {
      this.filterFormGroup.get('compareDateFrom').reset(null, { emitEvent: false });
      this.filterFormGroup.get('compareDateTo').reset(null, { emitEvent: false });
      this.filterFormGroup.get('compareDateFrom').disable({ emitEvent: false });
      this.filterFormGroup.get('compareDateTo').disable();
    } else {
      this.filterFormGroup.get('compareDateFrom').enable({ emitEvent: false });
      this.filterFormGroup.get('compareDateTo').enable();
    }

    this.isCompareMode.set(this.filterFormGroup.get('compareDateFrom').enabled);
  }

  protected loadData(): Observable<StatsModel[]> {
    return of([]).pipe(delay(500));
  }

  protected getQueryParamsFromFilterData(): StatsFiltersQueryParamsModel {
    return {
      dateFrom: this.datePipe.transform(this.filterFormGroup.value.dateFrom, 'yyyy-MM-dd'),
      dateTo: this.datePipe.transform(this.filterFormGroup.value.dateTo, 'yyyy-MM-dd'),
      compareDateFrom: this.datePipe.transform(this.filterFormGroup.value.compareDateFrom, 'yyyy-MM-dd'),
      compareDateTo: this.datePipe.transform(this.filterFormGroup.value.compareDateTo, 'yyyy-MM-dd'),
    };
  }

  protected setFilterValuesFromUrl(params: ParamMap): void {
    const keys = ['dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'];
    keys.forEach((key) => {
      const date = params.get(key);
      if (this.datesService.isValidDateString(date)) {
        this.filterFormGroup.get(key).setValue(new Date(date), { emitEvent: false });
      }
    });
  }

  private getDefaultDateFrom(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
  }

  private getDateValuesFromUrl(): StatsFiltersModel {
    const dateFrom = this.activatedRoute.snapshot.queryParamMap.get('dateFrom');
    const dateTo = this.activatedRoute.snapshot.queryParamMap.get('dateTo');
    const compareDateFrom = this.activatedRoute.snapshot.queryParamMap.get('compareDateFrom');
    const compareDateTo = this.activatedRoute.snapshot.queryParamMap.get('compareDateTo');
    // додано перевірку зачень дат введених в url на випадок, якщо юзер ввів невалідні дані
    return {
      dateFrom: this.datesService.isValidDateString(dateFrom) ? new Date(dateFrom) : null,
      dateTo: this.datesService.isValidDateString(dateTo) ? new Date(dateTo) : null,
      compareDateFrom: this.datesService.isValidDateString(compareDateFrom) ? new Date(compareDateTo) : null,
      compareDateTo: this.datesService.isValidDateString(compareDateTo) ? new Date(compareDateTo) : null,
    };
  }
}
