import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolComponent } from './pool.component';

describe('PoolComponent', () => {
  let component: PoolComponent;
  let fixture: ComponentFixture<PoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
