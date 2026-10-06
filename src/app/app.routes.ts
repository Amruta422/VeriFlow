import { Routes } from '@angular/router';
import { signedInGuard, adminGuard } from './core/guards';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/admin/users.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [signedInGuard] },
  { path: 'users', component: UsersComponent, canActivate: [signedInGuard, adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
