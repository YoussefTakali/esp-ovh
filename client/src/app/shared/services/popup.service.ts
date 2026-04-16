import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import {
  ActionDialogComponent,
  ActionDialogData,
  ActionDialogResult
} from '../dialogs/action-dialog/action-dialog.component';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface PromptOptions {
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor(private readonly dialog: MatDialog) {}

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const data: ActionDialogData = {
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      mode: 'confirm',
      variant: options.danger ? 'danger' : 'default'
    };

    const result = await this.openDialog(data);
    return !!result?.confirmed;
  }

  async prompt(options: PromptOptions): Promise<string | null> {
    const data: ActionDialogData = {
      title: options.title,
      message: options.message,
      mode: 'input',
      inputLabel: options.label,
      inputPlaceholder: options.placeholder,
      inputValue: options.initialValue,
      inputRequired: options.required ?? false,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel'
    };

    const result = await this.openDialog(data);
    if (!result?.confirmed) {
      return null;
    }

    return result.value ?? '';
  }

  private async openDialog(data: ActionDialogData): Promise<ActionDialogResult | undefined> {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      width: '460px',
      maxWidth: '95vw',
      panelClass: 'app-action-dialog-panel',
      disableClose: true,
      autoFocus: true,
      data
    });

    return firstValueFrom(dialogRef.afterClosed());
  }
}
