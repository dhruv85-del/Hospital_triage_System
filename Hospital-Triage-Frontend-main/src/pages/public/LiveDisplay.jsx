import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { realtime } from '../../services/realtime';
import { TokenStub } from '../../components/queue/TokenStub';
import { playCallChime } from '../../utils/sound';
import {
  Tv,
  Volume2,
  Maximize2,
  Clock,
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Bell,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export function LiveDisplay() {
  const { doctorId } = useParams();
  const [queues, setQueues] = useState([]);
  const [activeDoctor, setActiveDoctor] = useState(doctorId || 'all');
  const [doctors, setDoctors] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCalledToken, setLastCalledToken] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const allDocs = mockStore.getDoctors();
    setDoctors(allDocs);

    const today = new Date().toISOString().split('T')[0];
    const enriched = allDocs.map((doc) => {
      const apts = mockStore.getAppointments(doc.id, today);
      return {
        doctor: doc,
        called: apts.find((a) => a.status === 'CALLED') || null,
        inProgress: apts.find((a) => a.status === 'IN_PROGRESS') || null,
        waiting: apts.filter((a) => a.status === 'CHECKED_IN' || a.status === 'WAITING'),
        completed: apts.filter((a) => a.status === 'COMPLETED'),
      };
    });

    setQueues(enriched);

    // Identify if any token is CALLED
    const anyCalled = mockStore.data.appointments.find((a) => a.status === 'CALLED');
    if (anyCalled) {
      setLastCalledToken(anyCalled);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime queue events
    const unsub = realtime.subscribe('hospital:all', (event) => {
      loadData();
      if (event.appointment && event.appointment.status === 'CALLED') {
        setLastCalledToken(event.appointment);
        playCallChime();
      }
    });

    return () => unsub();
  }, []);

  const filteredQueues =
    activeDoctor === 'all'
      ? queues
      : queues.filter((q) => q.doctor.id === activeDoctor);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1513] text-white p-4 sm:p-8 flex flex-col justify-between -mx-4 -my-8 sm:-mx-8">
      {/* Top Billboard Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Return to Main Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-bezel">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                AuraFlow Public Waiting Billboard
              </h1>
              <p className="text-xs font-mono text-white/60 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-light" />
                <span>Zero-PII Privacy Protection Mode Active</span>
                <span>•</span>
                <span>Central Campus Wing A & B</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Live Clock */}
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-right font-mono">
              <div className="text-lg font-bold text-white leading-none">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Chime Sound Test Button */}
            <button
              onClick={() => playCallChime()}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Test Audio Chime"
            >
              <Volume2 className="w-5 h-5 text-primary-light" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullScreen}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Urgent Call Banner */}
        {lastCalledToken && lastCalledToken.status === 'CALLED' && (
          <div className="mt-6 p-4 rounded-2xl bg-amber/20 border border-amber/40 ring-2 ring-amber/30 flex items-center justify-between animate-call-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber text-ink font-bold flex items-center justify-center">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-amber-200">
                  Now Proceed to Consultation Room
                </p>
                <p className="text-xl font-mono font-bold text-amber-300">
                  TOKEN {lastCalledToken.tokenNumber}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-amber text-ink font-bold uppercase">
              Now Calling
            </span>
          </div>
        )}

        {/* Department / Doctor Filter Switch */}
        <div className="flex items-center gap-2 overflow-x-auto py-6">
          <button
            onClick={() => setActiveDoctor('all')}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
              activeDoctor === 'all'
                ? 'bg-primary text-white font-bold'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
            }`}
          >
            All Clinical Wings ({doctors.length})
          </button>
          {doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoctor(doc.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 whitespace-nowrap ${
                activeDoctor === doc.id
                  ? 'bg-primary text-white font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              {doc.name} ({doc.room})
            </button>
          ))}
        </div>

        {/* Multi-Clinic Live Billboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueues.map(({ doctor, called, inProgress, waiting }) => (
            <div
              key={doctor.id}
              className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 flex flex-col justify-between shadow-bezel space-y-4"
            >
              {/* Doctor & Room Header */}
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-display font-semibold text-base text-white">{doctor.name}</h3>
                  <p className="text-xs text-primary-light font-medium">{doctor.departmentName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 font-mono text-xs text-white/80">
                  {doctor.room}
                </span>
              </div>

              {/* Currently Called / In Progress Hero Tile */}
              <div>
                <p className="text-[11px] uppercase font-mono tracking-widest text-white/50 mb-2">
                  Currently Serving
                </p>
                {called ? (
                  <div className="p-4 rounded-2xl bg-amber/20 border border-amber/40 flex items-center justify-between animate-call-pulse">
                    <div>
                      <span className="text-[10px] font-mono text-amber-200 uppercase">Now Calling</span>
                      <div className="font-mono text-3xl font-bold text-amber-300">
                        {called.tokenNumber}
                      </div>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-amber animate-ping" />
                  </div>
                ) : inProgress ? (
                  <div className="p-4 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-primary-light uppercase">
                        In Room
                      </span>
                      <div className="font-mono text-3xl font-bold text-white">
                        {inProgress.tokenNumber}
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-mono text-white/40">
                    Physician Ready • No Active Patient
                  </div>
                )}
              </div>

              {/* Waiting Tokens Grid (Compact Stubs) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-2">
                  <span>Up Next in Line</span>
                  <span>{waiting.length} Waiting</span>
                </div>

                {waiting.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {waiting.slice(0, 6).map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-center"
                      >
                        <span className="font-mono text-base font-bold text-white">
                          {apt.tokenNumber}
                        </span>
                        <span className="block text-[9px] font-mono text-white/50">
                          {apt.status === 'CHECKED_IN' ? 'Present' : 'Booked'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 font-mono py-2 text-center">
                    Queue is clear.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Ticker Bar */}
      <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Realtime Stream Active • Updates Broadcast Instantly</span>
        </div>
        <p>Please present your token confirmation slip when entering consultation suites.</p>
      </div>
    </div>
  );
}
