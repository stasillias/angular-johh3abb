import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataValidationService {
  public isValidDateString(str: string): boolean {
    const date = new Date(str);
    return str && !isNaN(date.getTime());
  }

  public isValidInteger(str: string): boolean {
    const num = Number(str);
    return str && str.trim() !== '' && Number.isInteger(num);
  }
}
