import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function gstValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // GSTIN format: 15-character alphanumeric (e.g. 22AAAAA0000A1Z5)
    const clean = String(control.value).trim().toUpperCase();
    
    const isValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(clean);
    
    return isValid ? null : { invalidGst: { value: control.value } };
  };
}
