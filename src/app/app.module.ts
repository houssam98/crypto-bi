import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppComponent } from './containers/app/app.component';
import { environment } from '../environments/environment';
import { ChartComponent } from './components/chart/chart.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireFunctionsModule, USE_EMULATOR } from '@angular/fire/compat/functions';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  declarations: [AppComponent, AppHeaderComponent, ChartComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFirestoreModule,
  ],
  providers: [
    { provide: USE_EMULATOR, useValue: ['localhost', 5001] }
   ],
  bootstrap: [AppComponent],
})
export class AppModule {}
