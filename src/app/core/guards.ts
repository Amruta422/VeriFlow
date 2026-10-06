import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const signedInGuard: CanActivateFn = () => inject(AuthService).currentUser() ? true : inject(Router).createUrlTree(['/login']);
export const adminGuard: CanActivateFn = () => inject(AuthService).currentUser()?.role === 'admin' ? true : inject(Router).createUrlTree(['/dashboard']);
