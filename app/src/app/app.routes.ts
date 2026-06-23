import { Routes } from '@angular/router';
import { FeedHomeComponent } from './feed/feed-home.component';
import { ReaderComponent } from './feed/reader.component';

export const routes: Routes = [
  { path: '', component: FeedHomeComponent },
  { path: 'read/:id', component: ReaderComponent },
];
