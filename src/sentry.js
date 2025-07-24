import * as Sentry from "@sentry/react";
import i18n from "./Common/i18n";

export const initSentry = () => {
    Sentry.init({
        dsn: "https://17295d91fd0592f81ea4617dead3a675@o4509547224104960.ingest.de.sentry.io/4509558657384528",
        sendDefaultPii: true,
        integrations: [
            Sentry.feedbackIntegration({
                colorScheme: "system",
                isNameRequired: true,
                isEmailRequired: true,
                triggerLabel: i18n.t("reportBugLabel"),
                formTitle: i18n.t("reportBugTitle"),
                nameLabel: i18n.t("nameLabel"),
                namePlaceholder: i18n.t("namePlaceholder"),
                emailLabel: i18n.t("emailLabel"),
                emailPlaceholder: i18n.t("emailPlaceholder"),
                messageLabel: i18n.t("messageLabel"),
                messagePlaceholder: i18n.t("messagePlaceholder"),
                isRequiredLabel: i18n.t("isRequiredLabel"),
                addScreenshotButtonLabel: i18n.t("addScreenshotLabel"),
                removeScreenshotButtonLabel: i18n.t("removeScreenshotLabel"),
                submitButtonLabel: i18n.t("submitBugReportLabel"),
                cancelButtonLabel: i18n.t("cancelLabel"),
            }),
        ]
    });

    const interval = setInterval(() => {
        const shadowHost = document.getElementById('sentry-feedback');
        if (shadowHost && shadowHost.shadowRoot) {
            const btn = shadowHost.shadowRoot.querySelector('button.widget__actor');
            if (btn) {
                clearInterval(interval);
                // Make sure the button is fixed and on top
                btn.style.position = 'fixed';
                btn.style.zIndex = 9999;
                btn.style.cursor = 'grab';
                let isDragging = false, offsetX = 0, offsetY = 0, dragged = false, startX = 0, startY = 0;

                // Function to position dialog at button location
                const positionDialog = () => {
                    const captureBtn = shadowHost.shadowRoot.querySelector('button.btn.btn--default');
                    const content = shadowHost.shadowRoot.querySelector('.dialog__content');
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    const contentcapture = shadowHost.shadowRoot.querySelector('.dialog__content_capture');

                    if (captureBtn && content) {
                        clearInterval(interval);

                        captureBtn.addEventListener('click', () => {
                            content.classList.add('dialog__content_capture');
                        });
                    }

                    if (captureBtn && contentcapture) {
                        clearInterval(interval);

                        captureBtn.addEventListener('click', () => {
                            content.classList.remove('dialog__content_capture'); // Remove the class

                            // Reset styles applied during full screen mode
                            content.style.width = '';
                            content.style.height = '';
                            content.style.maxWidth = '';
                            content.style.maxHeight = '';
                            content.style.borderRadius = '';
                            content.style.boxShadow = '';
                            content.style.overflow = '';
                            content.style.padding = '';

                            content.style.removeProperty('--dialog-border-radius');
                            content.style.removeProperty('--dialog-padding');

                            // Optionally reset dialog too
                            if (dialog) {
                                dialog.style.width = '';
                                dialog.style.height = '';
                                dialog.style.top = '';
                                dialog.style.left = '';
                                dialog.style.right = '';
                                dialog.style.bottom = '';
                            }

                            // Optionally restore scroll
                            document.documentElement.style.height = '';
                            document.body.style.height = '';
                            document.body.style.overflow = '';
                        });
                    }



                    if (dialog && btn) {
                        const btnRect = btn.getBoundingClientRect();
                        const dialogRect = dialog.getBoundingClientRect();

                        let dialogLeft = btnRect.left;
                        let dialogTop = btnRect.top;

                        // Ensure dialog stays within viewport
                        dialogLeft = Math.max(0, Math.min(dialogLeft, window.innerWidth - dialogRect.width));
                        dialogTop = Math.max(0, Math.min(dialogTop, window.innerHeight - dialogRect.height));

                        if (contentcapture) {
                            // Force dialog and content to full screen
                            dialog.style.top = '0';
                            dialog.style.left = '0';
                            dialog.style.right = '0';
                            dialog.style.bottom = '0';
                            dialog.style.width = '100vw';
                            dialog.style.height = '100vh';

                            content.style.width = '100%';
                            content.style.height = '100%';
                            content.style.maxWidth = 'none';
                            content.style.maxHeight = 'none';
                            content.style.borderRadius = '0';
                            content.style.boxShadow = 'none';
                            content.style.overflow = 'auto';
                            content.style.padding = '2rem';

                            // Optional override of CSS vars
                            content.style.setProperty('--dialog-border-radius', '0');
                            content.style.setProperty('--dialog-padding', '2rem');
                        } else {
                            dialog.style.position = 'fixed';
                            dialog.style.left = dialogLeft + 'px';
                            dialog.style.top = dialogTop + 'px';
                            dialog.style.right = 'auto';
                            dialog.style.bottom = 'auto';
                            dialog.style.zIndex = '10000';
                        }
                    }

                };

                const handleSentryFocus = () => {
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    if (dialog && dialog.style.display !== 'none') {
                        // Find all focusable elements in the Sentry dialog
                        const focusableElements = dialog.querySelectorAll(
                            'input, textarea, button, select, [tabindex]:not([tabindex="-1"])'
                        );

                        // Track the last focused element within the Sentry dialog
                        let lastFocusedElement = null;

                        // Prevent other modals from stealing focus
                        const preventFocusSteal = (e) => {
                            // Check if the focused element is outside the Sentry dialog
                            if (!dialog.contains(e.target) && e.target !== btn) {
                                e.preventDefault();
                                e.stopPropagation();
                                // Return focus to the last focused element, or first input if none
                                if (lastFocusedElement && dialog.contains(lastFocusedElement)) {
                                    lastFocusedElement.focus();
                                } else {
                                    const firstInput = dialog.querySelector('input[type="text"], input[type="email"], textarea');
                                    if (firstInput) {
                                        firstInput.focus();
                                        lastFocusedElement = firstInput;
                                    }
                                }
                            }
                        };

                        // Track focus within the Sentry dialog
                        const trackFocus = (e) => {
                            if (dialog.contains(e.target)) {
                                lastFocusedElement = e.target;
                            }
                        };

                        // Add event listeners to prevent focus stealing and track focus
                        document.addEventListener('focusin', preventFocusSteal, true);
                        document.addEventListener('focusin', trackFocus);

                        // Store the event listener references for cleanup
                        dialog._focusHandler = preventFocusSteal;
                        dialog._trackHandler = trackFocus;

                        // Also add click event to inputs to ensure focus
                        focusableElements.forEach(element => {
                            element.addEventListener('mousedown', (e) => {
                                e.stopPropagation();
                            });
                            element.addEventListener('click', (e) => {
                                e.stopPropagation();
                                element.focus();
                                lastFocusedElement = element;
                            });
                        });
                    }
                };

                // Function to cleanup focus management
                const cleanupSentryFocus = () => {
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    if (dialog) {
                        if (dialog._focusHandler) {
                            document.removeEventListener('focusin', dialog._focusHandler, true);
                            delete dialog._focusHandler;
                        }
                        if (dialog._trackHandler) {
                            document.removeEventListener('focusin', dialog._trackHandler);
                            delete dialog._trackHandler;
                        }
                    }
                };

                // Watch for dialog appearance and handle focus
                const observer = new MutationObserver((mutations) => {
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    if (dialog) {
                        const isVisible = dialog.style.display !== 'none' &&
                            getComputedStyle(dialog).display !== 'none';

                        if (isVisible) {
                            setTimeout(() => {
                                positionDialog();
                                handleSentryFocus();
                            }, 10);
                        } else {
                            cleanupSentryFocus();
                        }
                    }
                });
                observer.observe(shadowHost.shadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });

                btn.addEventListener('mousedown', function (e) {
                    isDragging = true;
                    dragged = false;
                    startX = e.clientX;
                    startY = e.clientY;
                    offsetX = e.clientX - btn.getBoundingClientRect().left;
                    offsetY = e.clientY - btn.getBoundingClientRect().top;
                    btn.style.cursor = 'grabbing';
                });

                document.addEventListener('mousemove', function (e) {
                    if (isDragging) {
                        // If the mouse moved more than 3px, consider it a drag
                        if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
                            dragged = true;
                        }
                        // Calculate new position
                        let newLeft = e.clientX - offsetX;
                        let newTop = e.clientY - offsetY;
                        // Clamp to window bounds
                        const btnRect = btn.getBoundingClientRect();
                        const minLeft = 0;
                        const minTop = 0;
                        const maxLeft = window.innerWidth - btnRect.width;
                        const maxTop = window.innerHeight - btnRect.height;
                        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                        newTop = Math.max(minTop, Math.min(newTop, maxTop));
                        btn.style.left = newLeft + 'px';
                        btn.style.top = newTop + 'px';
                        btn.style.right = 'auto';
                        btn.style.bottom = 'auto';
                    }
                });

                document.addEventListener('mouseup', function () {
                    isDragging = false;
                    btn.style.cursor = 'grab';
                });

                // Prevent click if just dragged
                btn.addEventListener('click', function (e) {
                    if (dragged) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        dragged = false;
                    } else {
                        // Position dialog when button is clicked
                        setTimeout(() => {
                            positionDialog();
                            handleSentryFocus();
                        }, 10);
                    }
                }, true);
            }
        }
    }, 500);
};
