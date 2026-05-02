import React from 'react';
import { motion } from 'framer-motion';

const services = [
  { name: 'AI Inference Engine', uptime: '99.98%', bar: 99.98, status: 'Operational', region: 'Global Edge' },
  { name: 'Keypoint Stream API', uptime: '99.95%', bar: 99.95, status: 'Operational', region: 'ap-south-1' },
  { name: 'Member Dashboard', uptime: '100%', bar: 100, status: 'Operational', region: 'Global CDN' },
  { name: 'REST API Gateway', uptime: '99.99%', bar: 99.99, status: 'Operational', region: 'ap-south-1' },
  { name: 'Database Cluster', uptime: '99.91%', bar: 99.91, status: 'Operational', region: 'ap-south-1' },
  { name: 'Edge Device Registry', uptime: '99.87%', bar: 99.87, status: 'Degraded', region: 'Global Edge' },
  { name: 'Webhook Delivery', uptime: '99.96%', bar: 99.96, status: 'Operational', region: 'Global' },
  { name: 'Stripe Billing Relay', uptime: '100%', bar: 100, status: 'Operational', region: 'Global' }
];

const incidents = [
  {
    date: 'Apr 20, 2026',
    title: 'Keypoint API — Elevated Latency',
    detail: 'Between 14:32 and 14:46 UTC, the Keypoint Stream API experienced P99 latencies above 180ms, exceeding our 30ms SLA threshold. Root cause: GPU saturation on inference Node EU-West-2 due to an unthrottled batch job. The batch process was terminated at 14:44. Full recovery confirmed at 14:46.',
    resolved: true,
    duration: '14 min'
  },
  {
    date: 'Apr 08, 2026',
    title: 'Edge Device Registry — Registration Failures',
    detail: 'Between 09:12 and 09:18 UTC, new device registrations via the Admin Portal were failing with a 503 error. Root cause: Redis cache invalidation loop caused by a misconfigured TTL in the v2.4.0 firmware push. A config rollback was deployed and all registrations resumed at 09:18.',
    resolved: true,
    duration: '6 min'
  },
  {
    date: 'Mar 14, 2026',
    title: 'Scheduled Maintenance — Database Migration',
    detail: 'Planned maintenance window from 02:00–03:30 UTC for database schema migration to support the new Multi-Camera Sync feature. All services were restored within the scheduled window. No data was lost.',
    resolved: true,
    duration: '90 min (planned)'
  }
];

const uptimeHistory = [
  { month: 'Oct', pct: 100 },
  { month: 'Nov', pct: 99.99 },
  { month: 'Dec', pct: 99.97 },
  { month: 'Jan', pct: 100 },
  { month: 'Feb', pct: 99.98 },
  { month: 'Mar', pct: 99.93 },
  { month: 'Apr', pct: 99.96 }
];

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'Operational');
  const degradedCount = services.filter(s => s.status === 'Degraded').length;

  const renderedServices = [];
  for (let i = 0; i < services.length; i++) {
    const svc = services[i];
    const isOk = svc.status === 'Operational';
    renderedServices.push(
      <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
        <div className="flex items-center gap-4">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOk ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]' : 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]'} ${!isOk ? 'animate-pulse' : ''}`} />
          <div>
            <p className="text-white font-sans font-semibold text-sm">{svc.name}</p>
            <p className="text-gray-600 font-sans text-xs mt-0.5">{svc.region}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${isOk ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${svc.bar}%` }} />
          </div>
          <span className="text-gray-500 font-mono text-xs w-14 text-right">{svc.uptime}</span>
          <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-full border w-24 text-center ${isOk ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
            {svc.status}
          </span>
        </div>
      </div>
    );
  }

  const renderedIncidents = [];
  for (let i = 0; i < incidents.length; i++) {
    const inc = incidents[i];
    renderedIncidents.push(
      <div key={i} className="glass rounded-2xl border border-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-white font-bold font-sans text-base mb-1">{inc.title}</p>
            <p className="text-gray-500 font-mono text-xs">{inc.date} · Duration: {inc.duration}</p>
          </div>
          <span className="text-[10px] font-extrabold tracking-widest text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 flex-shrink-0">RESOLVED</span>
        </div>
        <p className="text-gray-400 font-sans text-sm leading-relaxed">{inc.detail}</p>
      </div>
    );
  }

  const renderedHistory = [];
  for (let i = 0; i < uptimeHistory.length; i++) {
    const h = uptimeHistory[i];
    const height = Math.max(4, ((h.pct - 99.8) / 0.2) * 100);
    const isFullyUp = h.pct === 100;
    renderedHistory.push(
      <div key={i} className="flex flex-col items-center gap-2 flex-1">
        <p className="text-gray-400 font-mono text-xs">{h.pct}%</p>
        <div className="w-full bg-white/5 rounded-full h-20 flex items-end overflow-hidden">
          <div
            className={`w-full rounded-full transition-all duration-700 ${isFullyUp ? 'bg-green-400' : 'bg-yellow-400'}`}
            style={{ height: `${Math.max(20, height)}%` }}
          />
        </div>
        <p className="text-gray-600 font-mono text-xs">{h.month}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border font-bold font-sans mb-6 ${allOperational ? 'border-green-400/30 text-green-400 bg-green-400/5' : 'border-yellow-400/30 text-yellow-400 bg-yellow-400/5'}`}>
            <span className={`w-2 h-2 rounded-full ${allOperational ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
            {allOperational ? 'All Systems Operational' : `${degradedCount} System${degradedCount > 1 ? 's' : ''} Degraded`}
          </div>
          <h1 className="text-5xl font-black font-sans text-white mb-4">System Status</h1>
          <p className="text-gray-400 font-sans text-base">Real-time health monitoring for all FitFix infrastructure. Updated every 30 seconds.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl border border-white/5 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase">Live Services</p>
            <p className="text-[10px] font-extrabold tracking-widest text-gray-600 uppercase">Updated 30s ago</p>
          </div>
          {renderedServices}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl border border-white/5 p-8 mb-8">
          <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-6">90-Day Uptime History</p>
          <div className="flex items-end gap-3 h-28">{renderedHistory}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-5">Incident History</p>
          <div className="flex flex-col gap-4">{renderedIncidents}</div>
        </motion.div>
      </div>
    </div>
  );
}
