import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsActionsComponent } from './transactions-actions.component';

describe('TransactionsActionsComponent', () => {
  let component: TransactionsActionsComponent;
  let fixture: ComponentFixture<TransactionsActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionsActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
