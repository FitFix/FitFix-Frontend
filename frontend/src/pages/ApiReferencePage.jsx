import React, { useState } from 'react';
import { motion } from 'framer-motion';

const endpointGroups = [
  {
    title: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/v1/auth/token',
        description: 'Exchange your API key for a short-lived Bearer token. Tokens expire after 3600 seconds.',
        params: [
          { name: 'api_key', type: 'string', required: true, desc: 'Your gym API key from the Admin Portal.' }
        ],
        request: `{
  "api_key": "fxk_live_a8d3f1c92b7e4a10"
}`,
        response: `{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}`
      },
      {
        method: 'POST',
        path: '/v1/auth/rotate',
        description: 'Rotate your API key. The old key is invalidated immediately. Returns the new key.',
        params: [],
        request: `Authorization: Bearer <TOKEN>`,
        response: `{
  "new_api_key": "fxk_live_z9c4b2e71a6d8f30",
  "rotated_at": "2026-04-28T06:00:00Z",
  "message": "Old key invalidated."
}`
      }
    ]
  },
  {
    title: 'Sessions',
    endpoints: [
      {
        method: 'POST',
        path: '/v1/sessions/start',
        description: 'Initializes a new real-time tracking session on a registered edge device. Returns a session ID for subsequent calls.',
        params: [
          { name: 'device_id', type: 'string', required: true, desc: 'The edge node device ID from your Admin Portal.' },
          { name: 'exercise_id', type: 'string', required: true, desc: 'Exercise slug from the exercise library (e.g., "bicep_curl", "squat").' },
          { name: 'member_id', type: 'string', required: false, desc: 'Optional. Associate the session with a specific member record.' }
        ],
        request: `{
  "device_id": "cam_edge_001",
  "exercise_id": "bicep_curl",
  "member_id": "mbr_8821"
}`,
        response: `{
  "session_id": "sess_f9a3c1",
  "status": "active",
  "exercise": "Bicep Curl",
  "device": "cam_edge_001",
  "member_id": "mbr_8821",
  "started_at": "2026-04-28T05:30:00Z"
}`
      },
      {
        method: 'GET',
        path: '/v1/sessions/:id/keypoints',
        description: 'Returns the latest keypoint snapshot from an active session. Keypoints use COCO-17 joint naming with pixel coordinates normalized to the input resolution.',
        params: [
          { name: 'id', type: 'string', required: true, desc: 'Session ID returned by /sessions/start.' }
        ],
        request: `GET /v1/sessions/sess_f9a3c1/keypoints
Authorization: Bearer <TOKEN>`,
        response: `{
  "session_id": "sess_f9a3c1",
  "frame_id": 1842,
  "timestamp": "2026-04-28T05:30:02.033Z",
  "keypoints": [
    { "name": "nose",          "x": 310, "y": 88,  "score": 0.99 },
    { "name": "left_shoulder", "x": 312, "y": 148, "score": 0.98 },
    { "name": "left_elbow",   "x": 330, "y": 210, "score": 0.96 },
    { "name": "left_wrist",   "x": 318, "y": 272, "score": 0.97 },
    { "name": "left_hip",     "x": 308, "y": 298, "score": 0.95 },
    { "name": "left_knee",    "x": 310, "y": 380, "score": 0.94 },
    { "name": "left_ankle",   "x": 308, "y": 460, "score": 0.93 }
  ],
  "primary_angle_deg": 142,
  "form_score": "Good Form",
  "form_color": "#00E5FF"
}`
      },
      {
        method: 'GET',
        path: '/v1/sessions/:id/reps',
        description: 'Returns the live rep count and the angle at which each rep peak was detected for an active session.',
        params: [
          { name: 'id', type: 'string', required: true, desc: 'Session ID.' }
        ],
        request: `GET /v1/sessions/sess_f9a3c1/reps
Authorization: Bearer <TOKEN>`,
        response: `{
  "session_id": "sess_f9a3c1",
  "total_reps": 14,
  "reps": [
    { "rep_number": 1, "peak_angle": 44, "form_flag": "good" },
    { "rep_number": 2, "peak_angle": 48, "form_flag": "good" },
    { "rep_number": 3, "peak_angle": 171, "form_flag": "hyperextension" }
  ]
}`
      },
      {
        method: 'POST',
        path: '/v1/sessions/:id/end',
        description: 'Closes an active session and returns the full performance summary including rep log, average form score, and flagged events.',
        params: [
          { name: 'id', type: 'string', required: true, desc: 'Session ID.' }
        ],
        request: `POST /v1/sessions/sess_f9a3c1/end
Authorization: Bearer <TOKEN>

{}`,
        response: `{
  "session_id": "sess_f9a3c1",
  "status": "completed",
  "duration_sec": 184,
  "total_reps": 32,
  "avg_form_score": 91.4,
  "peak_angle_min": 41,
  "peak_angle_max": 174,
  "flags": [
    { "type": "hyperextension", "count": 2, "at_reps": [3, 19] }
  ],
  "started_at": "2026-04-28T05:30:00Z",
  "ended_at": "2026-04-28T05:33:04Z"
}`
      }
    ]
  },
  {
    title: 'Members',
    endpoints: [
      {
        method: 'GET',
        path: '/v1/members',
        description: 'Returns a paginated list of all members registered to your gym. Supports filtering by name, active status, and plan tier.',
        params: [
          { name: 'page', type: 'integer', required: false, desc: 'Page number. Default: 1.' },
          { name: 'limit', type: 'integer', required: false, desc: 'Results per page. Default: 20, max: 100.' },
          { name: 'search', type: 'string', required: false, desc: 'Filter by member name or email.' }
        ],
        request: `GET /v1/members?page=1&limit=20&search=arnav
Authorization: Bearer <TOKEN>`,
        response: `{
  "total": 247,
  "page": 1,
  "limit": 20,
  "members": [
    {
      "member_id": "mbr_8821",
      "name": "Arnav S.",
      "email": "arnav@fitfix.io",
      "plan": "Elite",
      "total_sessions": 38,
      "avg_form_score": 89.2,
      "joined_at": "2026-01-15T00:00:00Z"
    }
  ]
}`
      },
      {
        method: 'GET',
        path: '/v1/members/:id/sessions',
        description: 'Returns a chronological log of all completed sessions for a specific member.',
        params: [
          { name: 'id', type: 'string', required: true, desc: 'Member ID.' },
          { name: 'from', type: 'ISO8601', required: false, desc: 'Filter sessions after this date.' },
          { name: 'to', type: 'ISO8601', required: false, desc: 'Filter sessions before this date.' }
        ],
        request: `GET /v1/members/mbr_8821/sessions?from=2026-04-01
Authorization: Bearer <TOKEN>`,
        response: `{
  "member_id": "mbr_8821",
  "sessions": [
    {
      "session_id": "sess_f9a3c1",
      "exercise": "Bicep Curl",
      "total_reps": 32,
      "avg_form_score": 91.4,
      "duration_sec": 184,
      "date": "2026-04-28"
    }
  ]
}`
      }
    ]
  },
  {
    title: 'Devices',
    endpoints: [
      {
        method: 'GET',
        path: '/v1/devices',
        description: 'Lists all registered edge nodes for your gym, including their current online/offline status and assigned zone.',
        params: [],
        request: `GET /v1/devices
Authorization: Bearer <TOKEN>`,
        response: `{
  "devices": [
    {
      "device_id": "cam_edge_001",
      "zone": "Squat Rack A",
      "status": "online",
      "firmware": "2.4.1",
      "uptime_sec": 86400,
      "last_seen": "2026-04-28T06:01:12Z"
    },
    {
      "device_id": "cam_edge_002",
      "zone": "Bicep Station",
      "status": "online",
      "firmware": "2.4.1",
      "uptime_sec": 72000,
      "last_seen": "2026-04-28T06:01:10Z"
    }
  ]
}`
      },
      {
        method: 'POST',
        path: '/v1/devices/:id/config',
        description: 'Push a configuration update to a specific edge node. Changes apply within 15 seconds without a device reboot.',
        params: [
          { name: 'confidence_threshold', type: 'float', required: false, desc: 'Min keypoint confidence score. Range: 0.1–0.9.' },
          { name: 'rep_buffer_ms', type: 'integer', required: false, desc: 'Dead-zone buffer after rep count in milliseconds.' },
          { name: 'form_alert_cooldown_ms', type: 'integer', required: false, desc: 'Min ms between auditory form alerts.' }
        ],
        request: `{
  "confidence_threshold": 0.45,
  "rep_buffer_ms": 400,
  "form_alert_cooldown_ms": 1500
}`,
        response: `{
  "device_id": "cam_edge_001",
  "config_applied": true,
  "applied_at": "2026-04-28T06:05:00Z"
}`
      }
    ]
  }
];

const methodColor = {
  GET: { badge: 'text-green-400 bg-green-400/10 border-green-400/30', dot: 'bg-green-400' },
  POST: { badge: 'text-accent bg-accent/10 border-accent/30', dot: 'bg-accent' },
  PUT: { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400' },
  DELETE: { badge: 'text-red-400 bg-red-400/10 border-red-400/30', dot: 'bg-red-400' }
};

export default function ApiReferencePage() {
  const allEndpoints = [];
  for (let i = 0; i < endpointGroups.length; i++) {
    for (let j = 0; j < endpointGroups[i].endpoints.length; j++) {
      allEndpoints.push({ ...endpointGroups[i].endpoints[j], group: endpointGroups[i].title });
    }
  }

  const [active, setActive] = useState(0);
  const ep = allEndpoints[active];
  const mc = methodColor[ep.method] || methodColor.GET;

  const renderedSidebarGroups = [];
  let globalIdx = 0;
  for (let i = 0; i < endpointGroups.length; i++) {
    const group = endpointGroups[i];
    const groupButtons = [];
    for (let j = 0; j < group.endpoints.length; j++) {
      const idx = globalIdx;
      const epItem = group.endpoints[j];
      const isMC = methodColor[epItem.method] || methodColor.GET;
      groupButtons.push(
        <button
          key={j}
          onClick={() => setActive(idx)}
          className={`text-left w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-xs font-mono flex items-center gap-2 ${
            active === idx ? 'bg-accent/10 text-accent border border-accent/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isMC.dot}`} />
          <span className={`font-bold w-10 flex-shrink-0 ${active === idx ? 'text-accent' : 'text-gray-500'}`}>{epItem.method}</span>
          <span className="truncate">{epItem.path}</span>
        </button>
      );
      globalIdx++;
    }
    renderedSidebarGroups.push(
      <div key={i} className="mb-5">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-2 px-2">{group.title}</p>
        <div className="flex flex-col gap-1">{groupButtons}</div>
      </div>
    );
  }

  const renderedParams = [];
  for (let i = 0; i < ep.params.length; i++) {
    const p = ep.params[i];
    renderedParams.push(
      <tr key={i} className="border-b border-white/5 last:border-0">
        <td className="py-3 pr-4 font-mono text-xs text-accent whitespace-nowrap">{p.name}</td>
        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{p.type}</td>
        <td className="py-3 pr-4">
          {p.required
            ? <span className="text-[9px] font-bold tracking-widest text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">REQUIRED</span>
            : <span className="text-[9px] font-bold tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">OPTIONAL</span>}
        </td>
        <td className="py-3 text-xs text-gray-400 font-sans">{p.desc}</td>
      </tr>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="mb-10">
        <div className="inline-block px-4 py-1.5 border border-accent/30 rounded-full text-accent text-xs font-bold tracking-widest mb-4">DEVELOPER PORTAL</div>
        <h1 className="text-4xl font-black font-sans text-white mb-3">API Reference</h1>
        <p className="text-gray-400 font-sans text-base max-w-2xl">
          Full REST API documentation for FitFix Pose Intelligence. Base URL: <code className="text-accent font-mono text-sm">https://api.fitfix.io</code>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="glass rounded-2xl p-4 border border-white/5 sticky top-24">
            <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-4 px-2">Endpoints</p>
            {renderedSidebarGroups}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">
            <div className="glass rounded-3xl border border-white/5 p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-bold font-mono ${mc.badge}`}>{ep.method}</span>
                <code className="text-white font-mono text-sm bg-white/5 px-3 py-1 rounded-lg">{ep.path}</code>
              </div>
              <p className="text-gray-400 font-sans text-sm leading-relaxed mb-6">{ep.description}</p>

              {ep.params.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-3">Parameters</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="pb-2 text-[10px] font-extrabold tracking-widest text-gray-600 uppercase pr-4">Name</th>
                          <th className="pb-2 text-[10px] font-extrabold tracking-widest text-gray-600 uppercase pr-4">Type</th>
                          <th className="pb-2 text-[10px] font-extrabold tracking-widest text-gray-600 uppercase pr-4">Required</th>
                          <th className="pb-2 text-[10px] font-extrabold tracking-widest text-gray-600 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody>{renderedParams}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-3xl border border-white/5 p-6">
                <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-4">Request</p>
                <pre className="text-accent text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{ep.request}</pre>
              </div>
              <div className="glass rounded-3xl border border-white/5 p-6">
                <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-4">Response 200 OK</p>
                <pre className="text-green-400 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{ep.response}</pre>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
