import { Component } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'crypto-bi';

  constructor(private fns: AngularFireFunctions) {}

  getPrices() {
    const fn = this.fns.httpsCallable('getLatest');
    fn({}).subscribe(console.log);
  }
}
