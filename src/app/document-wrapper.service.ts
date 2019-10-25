import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentWrapperService {
  /* istanbul ignore next */
  reloadPage(): void {
    document.location.reload();
  }
}
