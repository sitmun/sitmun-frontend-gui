import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-message',
  templateUrl: './dialog-message.component.html',
  styleUrls: ['./dialog-message.component.scss']
})
export class DialogMessageComponent implements OnInit {

  title: string;
  message: string;
  hideCancelButton : boolean=false;

  constructor(private dialogRef: MatDialogRef<DialogMessageComponent>){ }

  ngOnInit() {
  }

  doAccept(){
    this.dialogRef.close({event:'Accept'});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
