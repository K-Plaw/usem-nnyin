import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProficiencyLevel, LanguageCode } from '../types';
import { X, Bell, BellRing, Target, Clock, ShieldCheck, Check, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, updateUserPreferences, activeLanguage, setActiveLanguage } = useAuth();

  const [dailyGoal, setDailyGoal] = useState<number>(user?.daily_goal || 50);
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(
    user?.proficiency_level || 'beginner'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    user?.selected_language || activeLanguage || 'ibibio'
  );
  const [dailyReminder, setDailyReminder] = useState<boolean>(
    user?.notification_preferences?.daily_reminder ?? true
  );
  const [reminderTime, setReminderTime] = useState<string>(
    user?.notification_preferences?.reminder_time || '19:00'
  );
  const [browserNotifications, setBrowserNotifications] = useState<boolean>(
    user?.notification_preferences?.browser_notifications ?? false
  );
  const [streakFreezeAlerts, setStreakFreezeAlerts] = useState<boolean>(
    user?.notification_preferences?.streak_freeze_alerts ?? true
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notificationPermissionState, setNotificationPermissionState] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';
  });

  const handleToggleBrowserNotifications = async (checked: boolean) => {
    if (checked && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        setNotificationPermissionState(permission);
        if (permission === 'granted') {
          setBrowserNotifications(true);
          try {
            new Notification('Usem Nnyin Notifications Enabled', {
              body: 'Emesiere! You will now receive daily learning reminders to protect your streak.',
              icon: '/src/assets/images/mascot_usem_guide_1793364998164.jpg',
            });
          } catch {}
        } else {
          setBrowserNotifications(false);
        }
        return;
      }
    }
    setBrowserNotifications(checked);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    setActiveLanguage(selectedLanguage);

    const success = await updateUserPreferences({
      selected_language: selectedLanguage,
      proficiency_level: proficiencyLevel,
      daily_goal: dailyGoal,
      notification_preferences: {
        daily_reminder: dailyReminder,
        reminder_time: reminderTime,
        browser_notifications: browserNotifications,
        streak_freeze_alerts: streakFreezeAlerts,
      },
    });

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs overscroll-contain">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-2rem)] sm:max-h-[min(88dvh,720px)] flex flex-col shadow-2xl border border-stone-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Pinned top header */}
        <div className="px-6 py-4.5 sm:px-8 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
          <div className="space-y-0.5 pr-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
              Goals &amp; Notifications
            </h3>
            <p className="text-xs text-stone-500">
              Personalize your daily pace, primary language track, and practice alerts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="settings-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8 py-5 space-y-6"
        >
          {/* Daily XP Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-700" />
              <span>Daily Practice Goal</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Casual', xp: 30, desc: '5 min/day' },
                { label: 'Regular', xp: 50, desc: '10 min/day' },
                { label: 'Serious', xp: 100, desc: '20 min/day' },
              ].map((tier) => (
                <button
                  key={tier.xp}
                  type="button"
                  onClick={() => setDailyGoal(tier.xp)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    dailyGoal === tier.xp
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <p className="font-bold text-xs">{tier.label}</p>
                  <p className="text-sm font-extrabold tabular-nums text-stone-900 mt-0.5">{tier.xp} XP</p>
                  <p className="text-[10px] text-stone-400">{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Learning Language */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-900">
              Active Language Track
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedLanguage('ibibio')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedLanguage === 'ibibio'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <p className="font-bold text-xs">Ibibio Track</p>
                <p className="text-[11px] text-stone-500">Akwa Ibom State</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('efik')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedLanguage === 'efik'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <p className="font-bold text-xs">Efik Track</p>
                <p className="text-[11px] text-stone-500">Calabar &amp; Cross River</p>
              </button>
            </div>
          </div>

          {/* Proficiency Level */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-900">
              Proficiency Level
            </label>
            <select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value as ProficiencyLevel)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="beginner">Complete beginner (Starting from scratch)</option>
              <option value="basic">Basic understanding (Familiar with common salutations)</option>
              <option value="intermediate">Intermediate (Heritage learner / Conversational)</option>
            </select>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Practice Reminders &amp; Streak Protection
              </h4>
            </div>

            <div className="space-y-3">
              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-xs font-bold text-stone-900">Daily Study Reminder</p>
                  <p className="text-[11px] text-stone-500">Get a prompt to practice before the day ends</p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
              </div>

              {/* Reminder Time */}
              {dailyReminder && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Preferred Reminder Time</p>
                      <p className="text-[11px] text-stone-500">Best evening time for your 5-min lesson</p>
                    </div>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                  />
                </div>
              )}

              {/* Browser Push Notification Permission */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-xs font-bold text-stone-900">Browser Push Notifications</p>
                  <p className="text-[11px] text-stone-500">
                    Status: {notificationPermissionState === 'granted' ? 'Allowed' : notificationPermissionState}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => handleToggleBrowserNotifications(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
              </div>

              {/* Streak Alert */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-xs font-bold text-stone-900">Streak Freeze Warning</p>
                  <p className="text-[11px] text-stone-500">Alert me if my daily streak is at risk</p>
                </div>
                <input
                  type="checkbox"
                  checked={streakFreezeAlerts}
                  onChange={(e) => setStreakFreezeAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Pinned bottom action bar */}
        <div className="px-6 py-3.5 sm:px-8 border-t border-stone-100 shrink-0 bg-stone-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs rounded-xl hover:bg-stone-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
