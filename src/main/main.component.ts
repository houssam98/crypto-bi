
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
  selector: 'main-root',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  title = 'crypto-bi';
  marketData$!: Observable<MarketData[]>;
  keys!: string[];
  selectedBase = 'USDT';
  baseCurrencies = ['USD', 'USDT', 'USDC', 'BTC', 'ETH', 'BUSD', 'BNB'];
  refreshing = false;

  constructor(
    private fns: AngularFireFunctions,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.marketData$ = this.firestore
      .collection<MarketData>('prices', (ref) => ref.orderBy('name'))
      .valueChanges()
      .pipe(
        tap((data) => {
          this.keys = Object.keys(data[0].prices).sort((a, b) =>
            a.localeCompare(b)
          );
        })
      );
    this.marketData$.subscribe(console.log);
  }

  refreshPrices() {
    this.refreshing = true;
    const fn = this.fns.httpsCallable('refreshData');
    fn({}).subscribe(res => this.refreshing = false);
  }

  getNextUpdate(date: Date) {
    return new Date(date.getTime() + 5 * 60000);
  }

  setBase(ev: any) {
    this.selectedBase = ev.value;
  }
}
