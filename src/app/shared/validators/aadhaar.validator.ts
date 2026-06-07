import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function aadhaarValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // Let required validator handle empty fields

    const clean = String(control.value).replace(/\s/g, '');
    
    // Check if it's exactly 12 digits numeric
    const isValid = /^\d{12}$/.test(clean);
    
    return isValid ? null : { invalidAadhaar: { value: control.value } };
  };
}
