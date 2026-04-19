package com.financetracker.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 20)
    private String theme = "light";

    @Column(length = 10)
    private String currency = "USD";

    @Column(name = "notifications_enabled")
    private boolean notificationsEnabled = true;

    @Column(name = "sms_alerts_enabled")
    private boolean smsAlertsEnabled = false;

    @Column(name = "email_alerts_enabled")
    private boolean emailAlertsEnabled = true;

    @Column(length = 10)
    private String language = "en";

    private String timezone = "UTC";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isNotificationsEnabled() { return notificationsEnabled; }
    public void setNotificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; }

    public boolean isSmsAlertsEnabled() { return smsAlertsEnabled; }
    public void setSmsAlertsEnabled(boolean smsAlertsEnabled) { this.smsAlertsEnabled = smsAlertsEnabled; }

    public boolean isEmailAlertsEnabled() { return emailAlertsEnabled; }
    public void setEmailAlertsEnabled(boolean emailAlertsEnabled) { this.emailAlertsEnabled = emailAlertsEnabled; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public UserSettings() {}

    // Manual Builder
    public static UserSettingsBuilder builder() {
        return new UserSettingsBuilder();
    }

    public static class UserSettingsBuilder {
        private User user;
        private String theme = "light";
        private String currency = "USD";
        private boolean notificationsEnabled = true;
        private boolean smsAlertsEnabled = false;
        private boolean emailAlertsEnabled = true;
        private String language = "en";
        private String timezone = "UTC";

        public UserSettingsBuilder user(User user) { this.user = user; return this; }
        public UserSettingsBuilder theme(String theme) { this.theme = theme; return this; }
        public UserSettingsBuilder currency(String currency) { this.currency = currency; return this; }
        public UserSettingsBuilder notificationsEnabled(boolean notificationsEnabled) { this.notificationsEnabled = notificationsEnabled; return this; }
        public UserSettingsBuilder smsAlertsEnabled(boolean smsAlertsEnabled) { this.smsAlertsEnabled = smsAlertsEnabled; return this; }
        public UserSettingsBuilder emailAlertsEnabled(boolean emailAlertsEnabled) { this.emailAlertsEnabled = emailAlertsEnabled; return this; }
        public UserSettingsBuilder language(String language) { this.language = language; return this; }
        public UserSettingsBuilder timezone(String timezone) { this.timezone = timezone; return this; }

        public UserSettings build() {
            UserSettings us = new UserSettings();
            us.setUser(this.user);
            us.setTheme(this.theme);
            us.setCurrency(this.currency);
            us.setNotificationsEnabled(this.notificationsEnabled);
            us.setSmsAlertsEnabled(this.smsAlertsEnabled);
            us.setEmailAlertsEnabled(this.emailAlertsEnabled);
            us.setLanguage(this.language);
            us.setTimezone(this.timezone);
            return us;
        }
    }
}
