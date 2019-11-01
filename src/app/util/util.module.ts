import { NgModule } from '@angular/core';
import { ModalContainerComponent } from './modal/modal-container.component';
import { ClarityModule } from '@clr/angular';
import { NumberPickerComponent } from '@util/number-picker/number-picker.component';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';
import { CommonModule } from '@angular/common';
import { NumberModalComponent } from '@util/number-modal/number-modal.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    ModalContainerComponent,
    NumberPickerComponent,
    NumberPadComponent,
    NumberModalComponent
  ],
  imports: [
    CommonModule,
    ClarityModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  entryComponents: [
    NumberModalComponent
  ],
  exports: [
    ModalContainerComponent,
    NumberPickerComponent,
    NumberPadComponent
  ]
})
export class UtilModule {}
