import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { UserRole } from '../../models';

@Component({ selector: 'vf-login', standalone: true, imports: [FormsModule, NgIf], template: `
  <section class="login-layout"><div class="login-story"><a class="brand brand-light"><span class="brand-mark">v</span><span>veriflow<span class="brand-period">.</span><small>PEOPLE TRUST, VERIFIED</small></span></a>
    <div class="story-content"><div class="eyebrow light-eyebrow"><span></span> BUILT FOR CONFIDENCE</div><h1>Trust is built<br>on <em>what’s true.</em></h1><p>A thoughtful space to verify the work behind every great career.</p><div class="story-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit-core"><span>v</span><i>✓</i></div><div class="orbit-card orbit-card-top"><span class="mini-check">✓</span><span><b>Employment verified</b><small>Securely confirmed</small></span></div><div class="orbit-card orbit-card-bottom"><span class="mini-shield">◇</span><span><b>Privacy by design</b><small>Every detail protected</small></span></div></div></div><div class="story-footer"><span>MPLOYCHEK · PEOPLE OPERATIONS</span><span>01 / 03</span></div></div>
  <div class="login-panel"><div class="login-card"><div class="eyebrow"><span></span> YOUR WORKSPACE</div><h2>Welcome back</h2><p class="login-lead">Sign in to your verification workspace.</p><form (ngSubmit)="submit()"><label for="userid">User ID</label><div class="input-wrap"><span class="input-icon">◎</span><input id="userid" name="userid" [(ngModel)]="userId" placeholder="e.g. amruta" autocomplete="username" required></div><label for="password">Password</label><div class="input-wrap"><span class="input-icon">⌑</span><input id="password" name="password" [(ngModel)]="password" type="password" placeholder="Enter your password" autocomplete="current-password" required></div><label for="role">Sign in as</label><div class="select-wrap"><select id="role" name="role" [(ngModel)]="role"><option value="user">General user</option><option value="admin">Administrator</option></select><span>⌄</span></div><div class="error-note" *ngIf="error">{{ error }}</div><button class="button button-primary login-submit" [disabled]="loading">{{ loading ? 'Securely signing in…' : 'Continue securely' }} <span>→</span></button></form><div class="demo-box"><div class="demo-heading"><span>✦</span> DEMO ACCESS</div><div class="demo-accounts"><button type="button" (click)="fill('amruta','user')"><b>General user</b><span>amruta <i>·</i> demo123</span></button><button type="button" (click)="fill('melody','admin')"><b>Admin</b><span>melody <i>·</i> demo123</span></button></div></div><div class="login-privacy"><span>◇</span> Your session is protected with secure access controls</div></div><div class="login-legal">© 2026 VeriFlow <span>·</span> A clearer way to verify work</div></div></section>` })
export class LoginComponent {
  userId = ''; password = ''; role: UserRole = 'user'; loading = false; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  fill(id: string, role: UserRole): void { this.userId = id; this.password = 'demo123'; this.role = role; this.error = ''; }
  submit(): void {
    this.loading = true; this.error = '';
    this.auth.login(this.userId, this.password, this.role).subscribe({ next: () => { this.loading = false; void this.router.navigate(['/dashboard']); }, error: (e: { error?: { message?: string } }) => { this.loading = false; this.error = e.error?.message ?? 'We could not sign you in. Check your details and try again.'; } });
  }
}
