import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';

export const featureFlagGuard = (flag: string): CanActivateFn => {
  return () => {
    const storage = inject(StorageService);
    const router = inject(Router);
    
    const flags = storage.getItem<{ [key: string]: boolean }>(StorageKeys.FEATURE_FLAGS) || {};
    
    // Default to true if the flag doesn't exist, or check explicitly
    const isEnabled = flags[flag] !== false;
    
    return isEnabled ? true : router.parseUrl('/not-found');
  };
};
