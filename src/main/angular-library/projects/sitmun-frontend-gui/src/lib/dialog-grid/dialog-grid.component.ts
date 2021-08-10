import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  _GetAllsTable:  Array<() => Observable<any>>;
  _columnDefsTable: Array<any[]>;
  _singleSelectionTable: Array<boolean>;
}


@Component({
  selector: 'app-dialog-grid',
  templateUrl: './dialog-grid.component.html',
  styleUrls: ['./dialog-grid.component.scss']
})
export class DialogGridComponent implements OnInit {

  title: string;
  getAllRows: Subject<boolean> = new Subject <boolean>();
  private _addButtonClickedSubscription: any;
  tablesReceivedCounter: number;
  allRowsReceived: Array<any[]> = [];
  changeHeightButton : boolean;
  heightByDefault : any;

  //Inputs
  themeGrid: any;
  getAllsTable: Array<() => Observable<any>>;
  columnDefsTable: Array<any[]>;
  singleSelectionTable: Array<boolean>;
  titlesTable: Array<string>;
  orderTable: Array<string> = [];
  addButtonClickedSubscription: Observable <boolean> ;
  nonEditable: boolean;
  addFieldRestriction: Array<any> = [];
  fieldRestrictionWithDifferentName: Array<any> = [];
  currentData: Array<any> = [];

  //Outputs
  @Output() joinTables : EventEmitter<Array<any[]>>;

  


  constructor(private dialogRef: MatDialogRef<DialogGridComponent>) {
    
    this.joinTables = new EventEmitter();
    // this.nonEditable = true;
    this.tablesReceivedCounter = 0;
   }

  ngOnInit() {

    if (this.addButtonClickedSubscription) {
      this._addButtonClickedSubscription = this.addButtonClickedSubscription.subscribe(() => {
        this.getAllSelectedRows();
      });
    }

  }

  getAllSelectedRows() {
    this.getAllRows.next(true);
  }

  joinRowsReceived(data: any[])
  {
      this.allRowsReceived.push(data);
      this.tablesReceivedCounter++;
      if(this.tablesReceivedCounter === this.getAllsTable.length)
      {
        this.doAdd(this.allRowsReceived);
        console.log(this.allRowsReceived);
      }
  }

  doAdd(rowsToAdd){
    this.dialogRef.close({event:'Add',data: rowsToAdd});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
