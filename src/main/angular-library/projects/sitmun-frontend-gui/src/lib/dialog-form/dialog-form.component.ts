import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog'; 

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.css']
})
export class DialogFormComponent implements OnInit {

  form: FormGroup;
  title: string;
  HTMLReceived;
  constructor(private dialogRef: MatDialogRef<DialogFormComponent>) {}

  ngOnInit(): void {

  }


  doAdd(){
    this.dialogRef.close({event:'Add'});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
