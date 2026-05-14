"use client";

import { useEffect, useState } from "react";
import { getInstallBannerDismissed, setInstallBannerDismissed } from "@/lib/sessionState";

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already running as installed PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;
    if (getInstallBannerDismissed()) return;
    setVisible(true);
  }, []);

  function dismiss() {
    setInstallBannerDismissed();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="install-banner">
      {showInstructions ? (
        <div className="install-instructions">
          <p className="install-instructions-title">Add to Home Screen</p>
          <ol className="install-steps">
            <li>Tap the <strong>Share</strong> button at the bottom of Safari</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> in the top right</li>
          </ol>
          <button onClick={dismiss} className="install-dismiss">
            Got it
          </button>
        </div>
      ) : (
        <div className="install-prompt">
          <span className="install-text">Add to your home screen for offline use</span>
          <div className="install-actions">
            <button onClick={() => setShowInstructions(true)} className="install-how">
              How?
            </button>
            <button onClick={dismiss} className="install-dismiss-x" aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
