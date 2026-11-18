import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { mockStore } from '../../services/mockStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Settings, Save, CheckCircle, Bell, Clock, ShieldCheck } from 'lucide-react';

export function SystemSettings() {
  const currentSettings = mockStore.getSettings();
  const [threshold, setThreshold] = useState(currentSettings.approachingTurnThreshold || 2);
  const [defaultDuration, setDefaultDuration] = useState(currentSettings.defaultConsultTimeMin || 12);
  const [enableSound, setEnableSound] = useState(currentSettings.enableSoundChime !== false);
  const [enableAutoPrompt, setEnableAutoPrompt] = useState(currentSettings.enableAutoCallPrompt !== false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    mockStore.updateSettings({
      approachingTurnThreshold: parseInt(threshold, 10),
      defaultConsultTimeMin: parseInt(defaultDuration, 10),
      enableSoundChime: enableSound,
      enableAutoCallPrompt: enableAutoPrompt,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageContainer
      eyebrow="System Configuration"
      title="Queue Parameters & Triage Rules"
      subtitle="Configure proximity notification thresholds, default consultation estimates, and audio triggers."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {saved && (
          <div className="p-3.5 rounded-2xl bg-success-light border border-success-border text-xs text-success-800 font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Hospital settings saved successfully.</span>
          </div>
        )}

        <div className="double-bezel-outer">
          <div className="double-bezel-inner bg-surface space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Queue Thresholds */}
              <div className="space-y-4">
                <h3 className="text-sm font-display font-semibold text-ink pb-2 border-b border-border/70">
                  Notification & Proximity Trigger
                </h3>

                <Input
                  label="Approaching Turn Alert Threshold (Tokens Ahead)"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  helperText="Patients will receive a high-priority browser alert when their position reaches this number."
                  required
                />

                <Input
                  label="Default Baseline Consultation Duration (Minutes)"
                  type="number"
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  helperText="Used as default calculation base for estimated wait time ranges."
                  required
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-display font-semibold text-ink pb-2 border-b border-border/70">
                  Hardware & Audio Chimes
                </h3>

                <label className="p-4 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-ink block">
                      Web Audio Synthesizer Chimes
                    </span>
                    <span className="text-[11px] text-ink-muted">
                      Play acoustic chime when patient token is marked CALLED.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>

                <label className="p-4 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-ink block">
                      Automatic Doctor Queue Advance
                    </span>
                    <span className="text-[11px] text-ink-muted">
                      Prompt doctor when consultation completes to call next patient.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAutoPrompt}
                    onChange={(e) => setEnableAutoPrompt(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-border/70">
                <Button type="submit" variant="primary" size="md" icon={Save} trailingIcon>
                  Save System Parameters
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
