import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-translation',
  templateUrl: './dialog-translation.component.html',
  styleUrls: ['./dialog-translation.component.scss']
})
export class DialogTranslationComponent implements OnInit {

  translationForm: FormGroup;
  column: string;
  elementId: string;
  languageId: string;
  catalanValue: string;
  spanishValue: string;
  englishValue: string;

  constructor(private dialogRef: MatDialogRef<DialogTranslationComponent>) { 
    this.initializeTranslationForm();
  }

  ngOnInit(): void {
  }

  initializeTranslationForm(): void {

    this.translationForm = new FormGroup({
      catalanValue: new FormControl(null, []),
      spanishValue: new FormControl(null, []),
      englishValue: new FormControl(null, []),
    })
  }

  doAccept(){
    let data = {
      catalanValue: this.translationForm.value.catalanValue,
      spanishValue: this.translationForm.value.spanishValue,
      englishValue: this.translationForm.value.englishValue,
    }
    this.dialogRef.close({event:'Accept', data: data});
  }

  doDelete(){
    this.dialogRef.close({event:'Delete'});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
