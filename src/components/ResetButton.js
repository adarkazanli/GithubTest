/**
 * ResetButton Component
 * Manages the reset button UI and confirmation dialog
 */
class ResetButton {
  constructor(storageService, options = {}) {
    this.storageService = storageService;
    this.options = {
      buttonId: 'reset-button',
      dialogId: 'reset-dialog',
      messageContainerId: 'reset-messages',
      onResetComplete: null,
      onResetError: null,
      isImportInProgress: () => false,
      ...options,
    };

    this.isResetting = false;
    this.button = null;
    this.dialog = null;
    this.messageContainer = null;
    this.dialogResolve = null;
  }

  /**
   * Initialize the component
   */
  init() {
    this.button = document.getElementById(this.options.buttonId);
    this.dialog = document.getElementById(this.options.dialogId);
    this.messageContainer = document.getElementById(this.options.messageContainerId);

    if (!this.button || !this.dialog || !this.messageContainer) {
      console.error('ResetButton: Required DOM elements not found');
      return;
    }

    // Attach event listeners
    this.button.addEventListener('click', () => this.handleButtonClick());

    const confirmBtn = this.dialog.querySelector('#dialog-confirm');
    const cancelBtn = this.dialog.querySelector('#dialog-cancel');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.resolveDialog(true));
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resolveDialog(false));
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.dialog.hidden) {
        this.resolveDialog(false);
      }
    });
  }

  /**
   * Set button enabled/disabled state
   * @param {boolean} enabled - Whether button should be enabled
   */
  setEnabled(enabled) {
    if (!this.button) return;

    this.button.disabled = !enabled;
    this.button.setAttribute('aria-disabled', !enabled);

    // Show tooltip if disabled during import
    if (!enabled && this.options.isImportInProgress()) {
      this.button.title = 'Reset unavailable during import';
    } else {
      this.button.title = '';
    }
  }

  /**
   * Handle reset button click
   */
  async handleButtonClick() {
    // Don't allow reset during other operations
    if (this.isResetting || this.options.isImportInProgress()) {
      return;
    }

    // Disable button immediately
    this.setEnabled(false);
    this.isResetting = true;

    try {
      const confirmed = await this.showConfirmation();

      if (confirmed) {
        const result = await this.executeReset();

        if (result.success) {
          this.showSuccess();
          if (this.options.onResetComplete) {
            this.options.onResetComplete();
          }
        } else {
          this.showError(result.errors);
          if (this.options.onResetError) {
            this.options.onResetError(result.errors);
          }
        }
      }
    } finally {
      // Always re-enable when done
      this.isResetting = false;
      this.setEnabled(true);
    }
  }

  /**
   * Show confirmation dialog
   * @returns {Promise<boolean>} True if confirmed, false if cancelled
   */
  showConfirmation() {
    return new Promise((resolve) => {
      this.dialogResolve = resolve;
      this.dialog.hidden = false;

      // Focus cancel button (safe default)
      const cancelBtn = this.dialog.querySelector('#dialog-cancel');
      if (cancelBtn) {
        cancelBtn.focus();
      }
    });
  }

  /**
   * Hide confirmation dialog
   */
  hideConfirmation() {
    this.dialog.hidden = true;
    if (this.dialogResolve) {
      this.dialogResolve(false);
      this.dialogResolve = null;
    }
  }

  /**
   * Resolve dialog promise
   * @param {boolean} confirmed
   */
  resolveDialog(confirmed) {
    this.dialog.hidden = true;
    if (this.dialogResolve) {
      this.dialogResolve(confirmed);
      this.dialogResolve = null;
    }
  }

  /**
   * Execute reset operation
   * @returns {Promise<Object>} Reset result
   */
  async executeReset() {
    return await this.storageService.resetAll();
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.showMessage('✓ All data cleared successfully', 'success');
  }

  /**
   * Show error message
   * @param {Array<string>} errors - Array of error messages
   */
  showError(errors) {
    const errorList = errors.length > 1
      ? '<ul style="margin: 0.5rem 0 0 1rem; padding: 0;">' + errors.map(e => `<li>${e}</li>`).join('') + '</ul>'
      : errors[0] || 'An unexpected error occurred';

    this.showMessage(`⚠️ Reset partially failed:${errors.length > 1 ? '' : ' ' + errorList}${errors.length > 1 ? errorList : ''}`, 'error');
  }

  /**
   * Show message with auto-dismiss
   * @param {string} message - Message to display
   * @param {string} type - Message type ('success' or 'error')
   */
  showMessage(message, type) {
    // Clear any existing message
    this.messageContainer.innerHTML = '';

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.innerHTML = `
      ${message}
      <button type="button" class="message-dismiss" aria-label="Dismiss message">&times;</button>
    `;

    // Add dismiss button handler
    const dismissBtn = messageDiv.querySelector('.message-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        messageDiv.remove();
      });
    }

    this.messageContainer.appendChild(messageDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

export default ResetButton;
