import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstractComponent } from '../../../shared/components/filtered-abstract.component';
import { UiToggleGroupSingleDirective } from '../../../shared/directives/ui-toggle-group-single.directive';

import { ControlsOf } from '../../../shared/models/controls-of';
import { ReplaceDatesWithStrings } from '../../../shared/models/replace-dates-with-strings';
import { DataValidationService } from '../../../shared/services/data-validation.service';

type LoggerModel = {
  accountId: number;
  needToFix: boolean;
  level: string[];
  title: string;
  datetime: Date;
};

type LoggerFiltersModel = Partial<
  Omit<LoggerModel, 'datetime'> & {
    createdDateFrom: Date;
    createdDateTo: Date;
  }
>;

type LoggerFiltersQueryParamsModel = ReplaceDatesWithStrings<LoggerFiltersModel>;

@Component({
  selector: 'logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatBadge,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatNativeDateModule,
    MatProgressBarModule,
    UiToggleGroupSingleDirective,
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoggerComponent
  extends FilteredAbstractComponent<LoggerModel[], LoggerFiltersModel, LoggerFiltersQueryParamsModel>
  implements OnInit
{
  protected needFixCount = signal<number>(1);

  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);
  private readonly datesService = inject(DataValidationService);

  protected createFilters(): FormGroup<ControlsOf<LoggerFiltersModel>> {
    return this.fb.group<ControlsOf<LoggerFiltersModel>>({
      accountId: this.fb.control<number>(null),
      needToFix: this.fb.control<boolean>(null),
      level: this.fb.control<string[]>(null),
      title: this.fb.control<string>(null),
      createdDateFrom: this.fb.control<Date>(null),
      createdDateTo: this.fb.control<Date>(null),
    });
  }

  protected loadData(): Observable<LoggerModel[]> {
    return of([]).pipe(delay(500));
  }

  protected getQueryParamsFromFilterData(): LoggerFiltersQueryParamsModel {
    return {
      accountId: this.filterFormGroup.value.accountId,
      title: this.filterFormGroup.value.title,
      needToFix: this.filterFormGroup.value.needToFix,
      level: this.filterFormGroup.value.level,
      createdDateFrom: this.datePipe.transform(this.filterFormGroup.value.createdDateFrom, 'yyyy-MM-dd'),
      createdDateTo: this.datePipe.transform(this.filterFormGroup.value.createdDateTo, 'yyyy-MM-dd'),
    };
  }

  protected setFilterValuesFromUrl(params: ParamMap): void {
    const accountId = params.get('accountId');
    const needToFix = params.get('needToFix');
    const title = params.get('title');
    const level = params.getAll('level');
    const createdDateFrom = params.get('createdDateFrom');
    const createdDateTo = params.get('createdDateTo');
    if (this.datesService.isValidInteger(accountId)) {
      this.filterFormGroup.get('accountId').setValue(parseInt(accountId), { emitEvent: false });
    }
    if (title) {
      this.filterFormGroup.get('title').setValue(title, { emitEvent: false });
    }
    if (needToFix) {
      this.filterFormGroup.get('needToFix').setValue(JSON.parse(needToFix), { emitEvent: false });
    }
    if (level) {
      this.filterFormGroup.get('level').setValue(level, { emitEvent: false });
    }
    if (this.datesService.isValidDateString(createdDateFrom)) {
      this.filterFormGroup.get('createdDateFrom').setValue(new Date(createdDateFrom), { emitEvent: false });
    }
    if (this.datesService.isValidDateString(createdDateTo)) {
      this.filterFormGroup.get('createdDateTo').setValue(new Date(createdDateTo), { emitEvent: false });
    }
  }
}
