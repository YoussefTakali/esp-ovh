import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ActionDialogMode = 'confirm' | 'input';

export interface ActionDialogData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  mode?: ActionDialogMode;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  inputRequired?: boolean;
}

export interface ActionDialogResult {
  confirmed: boolean;
  value?: string;
}

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent {
  value = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ActionDialogComponent, ActionDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ActionDialogData
  ) {
    this.value = data.inputValue ?? '';
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onConfirm(): void {
    if (this.isInputMode() && this.data.inputRequired && !this.value.trim()) {
      return;
    }

    this.dialogRef.close({
      confirmed: true,
      value: this.isInputMode() ? this.value.trim() : undefined
    });
  }

  isInputMode(): boolean {
    return this.data.mode === 'input';
  }
}
