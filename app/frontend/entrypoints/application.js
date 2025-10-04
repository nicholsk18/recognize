import { Turbo } from '@hotwired/turbo-rails';
import * as bootstrap from 'bootstrap';
import './styles.scss';

// Start Turbo
Turbo.start();

function showAllToasts() {
  const toastElements = document.querySelectorAll('#toast-container .toast');
  toastElements.forEach(el => {
    const toast = bootstrap.Toast.getOrCreateInstance(el);
    toast.show();
  });
}

document.addEventListener('turbo:load', showAllToasts);
document.addEventListener('DOMContentLoaded', showAllToasts);

// Expose for debugging if needed
window.bootstrap = bootstrap;

// Auto-show any toasts dynamically appended to the container (e.g., Turbo Streams)
const toastContainer = document.getElementById('toast-container');
if (toastContainer) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.classList.contains('toast')
          ) {
            const toast = bootstrap.Toast.getOrCreateInstance(node);
            toast.show();
          }
        });
      }
    }
  });
  observer.observe(toastContainer, { childList: true });
}

// Modal management for Turbo forms
class ModalManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('turbo:submit-end', this.handleSubmitEnd.bind(this));
  }

  handleSubmitEnd(event) {
    const detail = event.detail || {};
    const fetchResponse = detail.fetchResponse;
    const status = fetchResponse && fetchResponse.response && fetchResponse.response.status;
    const succeeded = detail.success === true ||
                     (fetchResponse && fetchResponse.succeeded === true) ||
                     (status && status >= 200 && status < 300);

    if (succeeded) {
      this.closeModalOnSuccess(event.target);
    } else if (status === 422) {
      this.handleValidationErrors(event.target);
    }
  }

  closeModalOnSuccess(form) {
    const modal = this.findModalForForm(form);
    if (modal) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
      setTimeout(() => modalInstance.hide(), 0);
    }
  }

  handleValidationErrors(form) {
    const modal = this.findModalForForm(form);
    if (modal) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
      setTimeout(() => modalInstance.show(), 0);

      // Focus first invalid field after form replacement
      requestAnimationFrame(() => {
        const invalid = modal.querySelector('.is-invalid, .invalid-feedback');
        if (invalid) {
          const control = invalid.classList.contains('invalid-feedback')
            ? invalid.previousElementSibling
            : invalid;
          if (control && typeof control.focus === 'function') control.focus();
        }
      });
    }
  }

  findModalForForm(form) {
    if (!form || !form.closest) return null;

    // Check if form is inside a modal
    const modal = form.closest('.modal');
    if (modal) return modal;

    // For delete operations, don't try to close modals
    const method = form.method || form.querySelector('input[name="_method"]')?.value;
    if (method === 'delete') return null;

    return null;
  }
}

// Initialize modal manager
new ModalManager();
