import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({ selector: 'vf-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf], template: `
  <div class="app-frame" [class.auth-frame]="!auth.currentUser()">
    <aside class="sidebar" *ngIf="auth.currentUser() as user">
      <a class="brand" routerLink="/dashboard"><span class="brand-mark">v</span><span>veriflow<span class="brand-period">.</span><small>PEOPLE TRUST, VERIFIED</small></span></a>
      <div class="workspace-label">WORKSPACE</div>
      <a class="nav-item" routerLink="/dashboard" routerLinkActive="selected"><span class="nav-icon">◫</span>Overview</a>
      <a class="nav-item" *ngIf="user.role === 'admin'" routerLink="/users" routerLinkActive="selected"><span class="nav-icon">♧</span>People<span class="nav-count">{{ peopleCount }}</span></a>
      <div class="sidebar-bottom"><div class="secure-note"><span class="secure-dot"></span><span><b>Workspace protected</b><small>Encrypted demo environment</small></span></div><button class="profile-button" (click)="auth.logout()"><span class="avatar">{{ initials(user.name) }}</span><span class="profile-copy"><b>{{ user.name }}</b><small>{{ user.role === 'admin' ? 'Workspace admin' : 'General user' }}</small></span><span class="logout-arrow">↗</span></button></div>
    </aside>
    <main class="main-area"><router-outlet /></main>
  </div>` })
export class AppComponent {
  peopleCount = 5;
  constructor(readonly auth: AuthService, private router: Router) {}
  initials(name: string): string { return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
}
