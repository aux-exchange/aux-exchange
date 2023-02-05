import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HippoCoinInfo } from '../pool';
import { PoolService } from '../pool.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css'],
})
export class CoinsComponent implements OnInit {
  coins?: Observable<HippoCoinInfo[]>;

  constructor(private poolService: PoolService) {}

  ngOnInit(): void {
    this.coins = this.poolService.getCoinList('mainnet');
  }
}
