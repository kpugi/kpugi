'use client';

import { Crisp } from 'crisp-sdk-web';

/**
 * Opens the Crisp chat / ticket messenger programmatically.
 */
export function openCrispChat() {
  if (typeof window === 'undefined') return;
  try {
    Crisp.chat.open();
    Crisp.chat.show();
  } catch (err) {
    console.warn('[Crisp] Failed to open chat:', err);
  }
}

/**
 * Closes the Crisp chat window.
 */
export function closeCrispChat() {
  if (typeof window === 'undefined') return;
  try {
    Crisp.chat.close();
  } catch (err) {
    console.warn('[Crisp] Failed to close chat:', err);
  }
}

/**
 * Toggles the Crisp chat window visibility.
 */
export function toggleCrispChat() {
  if (typeof window === 'undefined') return;
  try {
    if (Crisp.chat.isChatOpened()) {
      Crisp.chat.close();
    } else {
      Crisp.chat.open();
      Crisp.chat.show();
    }
  } catch (err) {
    console.warn('[Crisp] Failed to toggle chat:', err);
  }
}

/**
 * Opens the Crisp Helpdesk / Knowledge Base view directly.
 */
export function openCrispHelpdesk(query?: string) {
  if (typeof window === 'undefined') return;
  try {
    Crisp.chat.open();
    Crisp.chat.show();
    Crisp.chat.setHelpdeskView();
    if (query) {
      Crisp.chat.queryHelpdesk(query);
    }
  } catch (err) {
    console.warn('[Crisp] Failed to open helpdesk:', err);
  }
}

/**
 * Updates the user's Crisp identity and custom Kpugi context attributes.
 */
export function setCrispUserData(params: {
  email?: string;
  name?: string;
  avatar?: string;
  role?: string;
  userId?: string;
  customData?: Record<string, string | number | boolean>;
}) {
  if (typeof window === 'undefined') return;
  try {
    if (params.email) {
      Crisp.user.setEmail(params.email);
    }
    if (params.name) {
      Crisp.user.setNickname(params.name);
    }
    if (params.avatar) {
      Crisp.user.setAvatar(params.avatar);
    }

    const sessionData: Record<string, string | number | boolean> = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.userId ? { user_id: params.userId } : {}),
      ...(params.customData || {}),
    };

    if (Object.keys(sessionData).length > 0) {
      Crisp.session.setData(sessionData);
    }
  } catch (err) {
    console.warn('[Crisp] Failed to update user data:', err);
  }
}

/**
 * Resets the Crisp session (called on user logout).
 */
export function resetCrispSession() {
  if (typeof window === 'undefined') return;
  try {
    Crisp.session.reset();
  } catch (err) {
    console.warn('[Crisp] Failed to reset session:', err);
  }
}
