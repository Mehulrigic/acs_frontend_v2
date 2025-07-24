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
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    if (dialog && btn) {
                        const btnRect = btn.getBoundingClientRect();
                        const dialogRect = dialog.getBoundingClientRect();

                        let dialogLeft = btnRect.left;
                        let dialogTop = btnRect.top;

                        // Ensure dialog stays within viewport
                        dialogLeft = Math.max(0, Math.min(dialogLeft, window.innerWidth - dialogRect.width));
                        dialogTop = Math.max(0, Math.min(dialogTop, window.innerHeight - dialogRect.height));

                        dialog.style.position = 'fixed';
                        dialog.style.left = dialogLeft + 'px';
                        dialog.style.top = dialogTop + 'px';
                        dialog.style.right = 'auto';
                        dialog.style.bottom = 'auto';
                    }
                };

                // Watch for dialog appearance
                const observer = new MutationObserver(() => {
                    const dialog = shadowHost.shadowRoot.querySelector('.dialog__position');
                    if (dialog && dialog.style.display !== 'none') {
                        setTimeout(positionDialog, 10);
                    }
                });
                observer.observe(shadowHost.shadowRoot, { childList: true, subtree: true, attributes: true });

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
                        setTimeout(positionDialog, 10);
                    }
                }, true);
            }
        }
    }, 500);
};
