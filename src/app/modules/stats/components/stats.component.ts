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

export type StatsModel = {};

export type StatsFiltersModel = Partial<{
  dateFrom: Date;
  dateTo: Date;
  compareDateFrom: Date;
  compareDateTo: Date;
}>;

@Component({
  selector: 'stats-stats',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent extends FilteredAbstractComponent<StatsModel[], StatsFiltersModel> implements OnInit {
  protected isCompareMode = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);

  protected createFilters(): FormGroup<ControlsOf<StatsFiltersModel>> {
    // дефолтні значення для фільтрів
    const today = new Date();
    return this.fb.group<ControlsOf<StatsFiltersModel>>({
      dateFrom: this.fb.control<Date>(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
        Validators.required,
      ),
      dateTo: this.fb.control<Date>(today, Validators.required),
      compareDateFrom: this.fb.control<Date>({ value: null, disabled: true }, Validators.required),
      compareDateTo: this.fb.control<Date>({ value: null, disabled: true }, Validators.required),
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
}
