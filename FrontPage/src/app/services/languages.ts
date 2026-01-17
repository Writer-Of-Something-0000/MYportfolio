import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languages = ['En', 'Ge'];
  private currentLanguage = 'Eng';

  getLanguages() {
    return this.languages;
  }

  getCurrent() {
    return this.currentLanguage;
  }

  setCurrent(lang: string) {
    this.currentLanguage = lang;
    console.log('Language set to:', lang);
  }
}