import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './containers/app/app.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { environment } from '../environments/environment';
import { ChartComponent } from './components/chart/chart.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  declarations: [AppComponent, AppHeaderComponent, ChartComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
