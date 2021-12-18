import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable, tap } from 'rxjs';

interface MarketData {
  id: string;
  modified: any;
  name: string;
  prices: { [key: string]: { [key: string]: number } };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'crypto-bi';
  marketData$!: Observable<MarketData[]>;
  keys!: string[];

  constructor(
    private fns: AngularFireFunctions,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.marketData$ = this.firestore
      .collection<MarketData>('prices', (ref) => ref.orderBy('name'))
      .valueChanges()
      .pipe(
        tap(
          (data) =>
            (this.keys = Object.keys(data[0].prices).sort((a, b) =>
              a.localeCompare(b)
            ))
        )
      );
    this.marketData$.subscribe(console.log);
  }

  refreshPrices() {
    console.log(this.keys);
    const fn = this.fns.httpsCallable('getLatest');
    fn({}).subscribe(console.log);
  }
}
