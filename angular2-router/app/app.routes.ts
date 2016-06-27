import { provideRouter, RouterConfig } from '@angular/router';

import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

export const routes: RouterConfig = [
  //{ path: '', component: HomeComponent },
  //{ path: 'about', component: AboutComponent }
  { path: '',                  component: HomeComponent },
  { path: ':country',          component: HomeComponent },
  { path: ':country/home',     component: HomeComponent },
  { path: ':country/about',    component: AboutComponent }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
