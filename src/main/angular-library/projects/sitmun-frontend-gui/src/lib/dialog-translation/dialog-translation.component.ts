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
  translationsMap:  Map<string, any>;
  languageByDefault:  string;
  languagesAvailables: Array<any>;
  catalanAvailable = false;
  catalanValue: string;
  spanishAvailable = false;
  spanishValue: string;
  englishAvailable = false;
  englishValue: string;
  araneseAvailable = false;
  araneseValue: string;
  frenchAvailable = false;
  frenchValue: string;

  constructor(private dialogRef: MatDialogRef<DialogTranslationComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
    this.initializeTranslationForm();
    this.matIconRegistry.addSvgIcon(
      `icon_lang_ca`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/flag_ca.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_es`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/flag_es.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_en`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/flag_en.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_oc`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/flag_oc.svg')
    );
    this.matIconRegistry.addSvgIcon(
      `icon_lang_fr`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/flag_fr.svg')
    );
  }

  ngOnInit(): void {

    this.checkLanguagesAvailables();
    this.checkTranslationsAlreadyDone();
    // if(this.catalanValue != null){
    //   this.translationForm.patchValue({
    //     catalanValue: this.catalanValue
    //   })
    // }
    // if(this.spanishValue != null){
    //   this.translationForm.patchValue({
    //     spanishValue: this.spanishValue
    //   })
    // }
    // if(this.englishValue != null){
    //   this.translationForm.patchValue({
    //     englishValue: this.englishValue
    //   })
    // }
    // if(this.araneseValue != null){
    //   this.translationForm.patchValue({
    //     araneseValue: this.araneseValue
    //   })
    // }
    // if(this.frenchValue != null){
    //   this.translationForm.patchValue({
    //     frenchValue: this.frenchValue
    //   })
    // }
  }

  checkLanguagesAvailables(): void {
    this.languagesAvailables.forEach(element => {
      if(element.shortname == 'ca' && this.languageByDefault!= 'ca') {  this.catalanAvailable = true }
      if(element.shortname == 'es' && this.languageByDefault!= 'es') {  this.spanishAvailable = true }
      if(element.shortname == 'en' && this.languageByDefault!= 'en') {  this.englishAvailable = true }
      if(element.shortname == 'oc-aranes' && this.languageByDefault!= 'oc-aranes') {  this.araneseAvailable = true }
      if(element.shortname == 'fr' && this.languageByDefault!= 'fr') {  this.frenchAvailable = true }
    });
  }

  checkTranslationsAlreadyDone(): void {
    this.translationsMap.forEach((value: any, key: string) => {
      if(key == 'ca' && value && value.translation) { this.translationForm.patchValue({ catalanValue: value.translation }) }
      if(key == 'es' && value && value.translation) { this.translationForm.patchValue({ spanishValue: value.translation }) }
      if(key == 'en' && value && value.translation) { this.translationForm.patchValue({ englishValue: value.translation }) }
      if(key == 'oc-aranes' && value && value.translation) { this.translationForm.patchValue({ araneseValue: value.translation }) }
      if(key == 'fr' && value && value.translation) { this.translationForm.patchValue({ frenchValue: value.translation }) }
  });
  }

  initializeTranslationForm(): void {

    this.translationForm = new FormGroup({
      catalanValue: new FormControl(null, []),
      spanishValue: new FormControl(null, []),
      englishValue: new FormControl(null, []),
      araneseValue: new FormControl(null, []),
      frenchValue: new FormControl(null, []),
    })
  }

  doAccept(){
    if (this.translationsMap.has("ca") && this.translationForm.value.catalanValue) { this.translationsMap.get('ca').translation = this.translationForm.value.catalanValue }
    if (this.translationsMap.has("es") && this.translationForm.value.spanishValue) { this.translationsMap.get('es').translation = this.translationForm.value.spanishValue }
    if (this.translationsMap.has("en") && this.translationForm.value.englishValue) { this.translationsMap.get('en').translation = this.translationForm.value.englishValue }
    if (this.translationsMap.has("oc-aranes") && this.translationForm.value.araneseValue) { this.translationsMap.get('oc-aranes').translation = this.translationForm.value.araneseValue }
    if (this.translationsMap.has("fr") && this.translationForm.value.frenchValue) { this.translationsMap.get('fr').translation = this.translationForm.value.frenchValue }
    this.dialogRef.close({event:'Accept', data: this.translationsMap});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
