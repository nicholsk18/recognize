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

// Close recognition modal after successful Turbo form submission
document.addEventListener('turbo:submit-end', event => {
  const detail = event.detail || {};
  const fetchResponse = detail.fetchResponse;
  const status =
    fetchResponse && fetchResponse.response && fetchResponse.response.status;
  const succeeded =
    detail.success === true ||
    (fetchResponse && fetchResponse.succeeded === true) ||
    (status && status >= 200 && status < 300);

  // Only close if the submitted form lives inside our recognition modal
  const submittedForm = event.target;
  const isRecognitionCreate =
    submittedForm &&
    submittedForm.action &&
    submittedForm.action.includes('/recognitions') &&
    (submittedForm.method || 'post').toLowerCase() === 'post';
  const inModal =
    submittedForm &&
    submittedForm.closest &&
    submittedForm.closest('#recognition-modal');
  if (!succeeded || (!inModal && !isRecognitionCreate)) return;

  // Find the currently shown modal (fallback to id)
  const shownModal =
    document.querySelector('#recognition-modal.modal.show') ||
    document.getElementById('recognition-modal');
  if (shownModal) {
    const modal = bootstrap.Modal.getOrCreateInstance(shownModal);
    // Delay slightly to avoid racing with Turbo Stream DOM updates
    setTimeout(() => modal.hide(), 0);
  }
});

// Keep modal open on validation errors (422) and focus the first invalid field
document.addEventListener('turbo:submit-end', event => {
  const detail = event.detail || {};
  const fetchResponse = detail.fetchResponse;
  const status =
    fetchResponse && fetchResponse.response && fetchResponse.response.status;
  if (status === 422) {
    const modalEl = document.getElementById('recognition-modal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      // Ensure it stays open (some flows might try to close it)
      setTimeout(() => modal.show(), 0);
    }
    // After Turbo replaces the form, focus first invalid control
    requestAnimationFrame(() => {
      const invalid = document.querySelector(
        '#recognition-modal .is-invalid, #recognition-modal .invalid-feedback'
      );
      if (invalid) {
        const control = invalid.classList.contains('invalid-feedback')
          ? invalid.previousElementSibling
          : invalid;
        if (control && typeof control.focus === 'function') control.focus();
      }
    });
  }
});
