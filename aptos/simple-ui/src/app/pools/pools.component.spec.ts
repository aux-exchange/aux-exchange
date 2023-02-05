import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolsComponent } from './pools.component';

describe('PoolsComponent', () => {
  let component: PoolsComponent;
  let fixture: ComponentFixture<PoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
