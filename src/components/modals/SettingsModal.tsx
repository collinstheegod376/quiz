'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useGame } from '@/context/GameContext';
import { sound } from '@/lib/sound';
import {
  X,
  Settings,
  User,
  Lock,
  Volume2,
  VolumeX,
  Clock,
  Trash2,
  ShieldAlert,
  Moon,
  Sun,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function SettingsModal() {
  const {
    currentUser,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    updateProfile,
    deleteAccount,
    logout,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSoundMuted, toggleSound } = useGame();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(currentUser?.username || 'Challenger');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  if (!isSettingsModalOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setIsSaving(true);

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`;
      const res = await updateProfile(
        username !== currentUser.username ? username : undefined,
        newPassword ? newPassword : undefined,
        avatarUrl
      );

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'Profile settings updated successfully.' });
        setNewPassword('');
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const randomizeAvatar = () => {
    const seeds = ['Luffy', 'Zoro', 'Nami', 'Sanji', 'Chopper', 'Robin', 'Law', 'Shanks', 'Ace', 'Goku', 'Naruto', 'Levi', 'Gojo'];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 999);
    setAvatarSeed(random);
  };

  const handleDelete = async () => {
    await deleteAccount();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsSettingsModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5" />
            Arena Configuration
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
            Combatant Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your arena credentials, audio preferences, and account lifecycle.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Section 1: Profile Edit */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Profile Credentials
          </h3>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-red-500 overflow-hidden shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={randomizeAvatar}
                className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition-colors"
                title="Change Avatar"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white block">Avatar Emblem</span>
              Click icon to cycle new avatar seeds.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Change Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <Button type="submit" variant="arena" size="md" className="w-full">
            Save Profile Changes
          </Button>
        </form>

        {/* Section 2: Preferences */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Arena Preferences
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Synthesized Audio</span>
                <span className="text-[11px] text-slate-400">Web Audio countdown ticks and chimes</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleSound}>
              {isSoundMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Color Scheme</span>
                <span className="text-[11px] text-slate-400">Current: {theme === 'dark' ? 'Dark Mode (Default)' : 'Light Mode'}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>

        {/* Section 3: Danger Zone / Delete Account */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Danger Zone
          </h3>

          {showDeleteConfirm ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
                Are you absolutely sure? This will permanently delete your combatant account, scores, and match statistics. This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Permanently Delete Account
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
              <div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">Delete Account</span>
                <span className="text-[11px] text-rose-600/70 dark:text-rose-400/70">Wipe profile, match history, and records.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-rose-600 border-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
            <span>Logged in as: {currentUser.username}</span>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-500 font-semibold underline transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
