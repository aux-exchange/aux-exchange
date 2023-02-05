import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoinsComponent } from './coins/coins.component';
import { PoolComponent } from './pool/pool.component';
import { PoolsComponent } from './pools/pools.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pools',
    pathMatch: 'full',
    title: 'simple ui for aux.exchange',
  },
  { path: 'pools', component: PoolsComponent, title: 'pools on aux.exchange' },
  { path: 'coins', component: CoinsComponent, title: 'coins' },
  { path: 'pool', component: PoolComponent, title: 'pool' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
