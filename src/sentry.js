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
};
