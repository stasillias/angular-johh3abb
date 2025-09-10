import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
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
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { FilteredAbstract } from '../shared/components/filtered-abstract';
import { ControlsOf } from '../shared/models/controls-of';
import { ReplaceDatesWithStrings } from '../shared/models/replace-dates-with-strings';
import { ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DataValidationService } from '../shared/services/data-validation-service';

enum PaymentType {
  Ep = 'ep',
  Epu = 'epu',
  Esv = 'esv',
}

type PaymentModel = {
  type: PaymentType;
  startDate: Date;
  endDate: Date;
  userId: number;
  accountId: number;
};

type PaymentFiltersModel = Partial<PaymentModel>;

type PaymentFiltersQueryParamsModel = ReplaceDatesWithStrings<PaymentFiltersModel>;

@Component({
  selector: 'payments',
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
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
    MatNativeDateModule,
    MatProgressBarModule,
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payments
  extends FilteredAbstract<PaymentModel[], PaymentFiltersModel, PaymentFiltersQueryParamsModel>
  implements OnInit
{
  protected readonly PaymentType = PaymentType;

  private readonly fb = inject(FormBuilder);
  private readonly datePipe = inject(DatePipe);
  private readonly datesService = inject(DataValidationService);

  protected createFilters(): FormGroup<ControlsOf<PaymentFiltersModel>> {
    return this.fb.group<ControlsOf<PaymentFiltersModel>>({
      type: this.fb.control<PaymentType>(null),
      startDate: this.fb.control<Date>(null),
      endDate: this.fb.control<Date>(null),
      accountId: this.fb.control<number>(null),
      userId: this.fb.control<number>(null),
    });
  }

  protected loadData(): Observable<PaymentModel[]> {
    return of([]).pipe(delay(500));
  }

  protected getQueryParamsFromFilterData(): PaymentFiltersQueryParamsModel {
    return {
      accountId: this.filterFormGroup.value.accountId,
      userId: this.filterFormGroup.value.userId,
      type: this.filterFormGroup.value.type,
      startDate: this.datePipe.transform(this.filterFormGroup.value.startDate, 'yyyy-MM-dd'),
      endDate: this.datePipe.transform(this.filterFormGroup.value.endDate, 'yyyy-MM-dd'),
    };
  }

  protected setFilterValuesFromUrl(params: ParamMap): void {
    const accountId = params.get('accountId');
    const userId = params.get('userId');
    const type = params.get('type');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    if (this.datesService.isValidInteger(accountId)) {
      this.filterFormGroup.get('accountId').setValue(parseInt(accountId), { emitEvent: false });
    }
    if (this.datesService.isValidInteger(userId)) {
      this.filterFormGroup.get('userId').setValue(parseInt(userId), { emitEvent: false });
    }
    if (type) {
      this.filterFormGroup.get('type').setValue(type as PaymentType, { emitEvent: false });
    }
    if (this.datesService.isValidDateString(startDate)) {
      this.filterFormGroup.get('startDate').setValue(new Date(startDate), { emitEvent: false });
    }
    if (this.datesService.isValidDateString(endDate)) {
      this.filterFormGroup.get('endDate').setValue(new Date(endDate), { emitEvent: false });
    }
  }
}
