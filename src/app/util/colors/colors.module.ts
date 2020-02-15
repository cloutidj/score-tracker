import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { ColorSwatchComponent } from './color-swatch/color-swatch.component';
import { ColorFilterComponent } from './color-filter/color-filter.component';

@NgModule({
  declarations: [
    ColorPickerComponent,
    ColorSwatchComponent,
    ColorFilterComponent
  ],
  imports: [
    CommonModule,
    ClarityModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  exports: [
    ColorPickerComponent,
    ColorSwatchComponent,
    ColorFilterComponent
  ]
})
export class ColorsModule { }
