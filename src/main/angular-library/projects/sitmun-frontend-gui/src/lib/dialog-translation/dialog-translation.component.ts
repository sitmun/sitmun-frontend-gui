import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: 'app-dialog-translation',
  templateUrl: './dialog-translation.component.html',
  styleUrls: ['./dialog-translation.component.scss']
})
export class DialogTranslationComponent implements OnInit {

  translationForm: FormGroup;
  catalanValue: string;
  spanishValue: string;
  englishValue: string;
  araneseValue: string;

  constructor(private dialogRef: MatDialogRef<DialogTranslationComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
    this.initializeTranslationForm();
    this.matIconRegistry.addSvgIcon(
      `icon_lang_ca`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/flag_ca.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_es`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/flag_es.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_en`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/flag_en.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_oc`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/flag_oc.svg')
    );
  }

  ngOnInit(): void {
    if(this.catalanValue != null){
      this.translationForm.patchValue({
        catalanValue: this.catalanValue
      })
    }
    if(this.spanishValue != null){
      this.translationForm.patchValue({
        spanishValue: this.spanishValue
      })
    }
    if(this.englishValue != null){
      this.translationForm.patchValue({
        englishValue: this.englishValue
      })
    }
    if(this.araneseValue != null){
      this.translationForm.patchValue({
        araneseValue: this.araneseValue
      })
    }
  }

  initializeTranslationForm(): void {

    this.translationForm = new FormGroup({
      catalanValue: new FormControl(null, []),
      spanishValue: new FormControl(null, []),
      englishValue: new FormControl(null, []),
      araneseValue: new FormControl(null, []),
    })
  }

  doAccept(){
    let data = {
      catalanValue: this.translationForm.value.catalanValue,
      spanishValue: this.translationForm.value.spanishValue,
      englishValue: this.translationForm.value.englishValue,
      araneseValue: this.translationForm.value.araneseValue,
    }
    this.dialogRef.close({event:'Accept', data: data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
