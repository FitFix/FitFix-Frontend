import React, { useState } from 'react';
import { motion } from 'framer-motion';

const sidebarCategories = [
  {
    title: 'Getting Started',
    items: ['Introduction', 'Quick Install', 'First Session', 'System Requirements']
  },
  {
    title: 'Hardware Setup',
    items: ['Camera Placement', 'Edge Device Config', 'Multi-Camera Sync', 'Calibration Guide']
  },
  {
    title: 'SDK & Integration',
    items: ['SDK Overview', 'Webhook Events', 'Custom Exercises', 'Member Data Export']
  }
];

const docContent = {
  'Introduction': {
    heading: 'Introduction to FitFix',
    badges: ['v2.4.1', 'Stable'],
    sections: [
      {
        type: 'text',
        content: 'FitFix Pose Intelligence is a real-time biomechanics engine designed exclusively for commercial gym environments. It uses edge-deployed computer vision — powered by a custom-trained YOLO model — to detect, classify, and score human movement at sub-30ms latency without ever sending raw video to the cloud.'
      },
      {
        type: 'text',
        content: 'This documentation covers the full lifecycle of a FitFix deployment: from unboxing your first edge node to querying session data via our REST API. Every page is written for technical operators, gym IT managers, and software developers integrating FitFix into a broader member management ecosystem.'
      },
      {
        type: 'highlight',
        title: 'Core Architecture',
        items: [
          'Edge Node: Runs YOLO inference locally on NVIDIA Jetson or equivalent hardware.',
          'Pose Stream: Keypoints are streamed over WebSocket to the dashboard in real-time.',
          'Cloud Layer: Aggregated performance metrics are synced post-session, never raw frames.',
          'Admin Portal: Gym operators manage devices, members, and analytics from a single dashboard.'
        ]
      },
      {
        type: 'text',
        content: 'FitFix is deployed in commercial gyms, physiotherapy clinics, and elite sports facilities across India. The platform handles 10,000+ sessions per day with 99.97% uptime on the inference engine.'
      }
    ]
  },
  'Quick Install': {
    heading: 'Quick Install',
    badges: ['~10 min', 'Hardware Required'],
    sections: [
      {
        type: 'text',
        content: 'The FitFix edge module is designed for zero-friction deployment. A trained technician is not required. Follow the steps below to go from box to live session in under 10 minutes.'
      },
      {
        type: 'steps',
        items: [
          { step: '01', title: 'Unbox & Power On', desc: 'Connect the edge node to power using the included DC adapter. Connect to your gym network via ethernet (Wi-Fi onboarding available in step 3).' },
          { step: '02', title: 'Mount Your Camera', desc: 'Connect the included 1080p USB camera to the edge node. Mount the camera 2.5–3.5m above floor level. See Camera Placement for detailed guidelines.' },
          { step: '03', title: 'Register the Device', desc: 'Navigate to your FitFix Admin Portal → Devices → Add New. Scan the QR code on the base of the edge unit. The system auto-assigns the device to your gym.' },
          { step: '04', title: 'Run Calibration', desc: 'In the Admin Portal, select the device and tap "Run Calibration." A staff member should stand in the centre of the frame. The system will auto-adjust for floor plane and lighting.' },
          { step: '05', title: 'Go Live', desc: 'Assign the device to a specific zone (e.g., Squat Rack, Bicep Station). Members can now begin tracked sessions from the FitFix member app.' }
        ]
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Enterprise customers receive white-glove onboarding. Our team will remotely supervise your first installation via video call at no additional cost.'
      }
    ]
  },
  'First Session': {
    heading: 'Running Your First Session',
    badges: ['Members', 'Admin'],
    sections: [
      {
        type: 'text',
        content: 'Once your device is registered and calibrated, starting a tracked session takes three steps for your gym members.'
      },
      {
        type: 'steps',
        items: [
          { step: '01', title: 'Member Login', desc: 'Members log in via the FitFix member app (iOS/Android) or through your gym\'s TV kiosk powered by FitFix.' },
          { step: '02', title: 'Select Exercise', desc: 'Members choose an exercise from the library (50+ movements available on Elite plan). The device automatically activates and begins pose tracking.' },
          { step: '03', title: 'Live Feedback', desc: 'A real-time skeleton overlay appears on the proximity screen. Colour-coded feedback (green = good form, red = correction needed) fires within 30ms of a detected error.' },
          { step: '04', title: 'Session Summary', desc: 'At the end of the set, a full summary appears: total reps, average form score, flags for any hyperextension events, and a joint angle heatmap.' }
        ]
      },
      {
        type: 'highlight',
        title: 'What is a Form Score?',
        items: [
          'Form Score is a 0–100 numeric rating generated by comparing the member\'s joint angles against validated biomechanical baselines.',
          'A score above 85 is considered "Good Form". Below 70 triggers a coaching alert.',
          'Scores are stored per-session and tracked over time to show member improvement curves in the Admin Analytics panel.'
        ]
      }
    ]
  },
  'System Requirements': {
    heading: 'System Requirements',
    badges: ['Hardware', 'Network'],
    sections: [
      {
        type: 'highlight',
        title: 'Edge Node (Minimum)',
        items: [
          'SoC: NVIDIA Jetson Nano (4GB) or equivalent ARM64 with CUDA support',
          'RAM: 4GB LPDDR4',
          'Storage: 32GB eMMC (128GB recommended for local session logs)',
          'OS: FitFix OS 2.x (Ubuntu 20.04 LTS base)',
          'Power: 5V/4A DC input'
        ]
      },
      {
        type: 'highlight',
        title: 'Camera (Minimum)',
        items: [
          'Resolution: 1080p (1920×1080) at 30fps minimum',
          'Interface: USB 3.0',
          'Field of View: 90° wide-angle recommended',
          'IR: Optional. Required for 24/7 low-light environments.',
          'Recommended: Logitech C920 or FitFix-branded camera bundle'
        ]
      },
      {
        type: 'highlight',
        title: 'Network',
        items: [
          'Ethernet: 100Mbps minimum for real-time dashboard sync',
          'Wi-Fi: WPA2/WPA3 supported (2.4GHz or 5GHz)',
          'Firewall: Outbound HTTPS (port 443) must be open to fitfix.io',
          'Offline Mode: Edge node operates fully offline. Session data syncs when connectivity is restored.'
        ]
      }
    ]
  },
  'Camera Placement': {
    heading: 'Camera Placement Guide',
    badges: ['Hardware', 'Critical'],
    sections: [
      {
        type: 'text',
        content: 'Optimal camera placement is the single most important factor for tracking accuracy. Incorrect placement is the root cause of over 90% of false-positive form alerts in new deployments.'
      },
      {
        type: 'highlight',
        title: 'Mounting Height & Angle',
        items: [
          'Mount cameras 2.5–3.5m above floor level.',
          'Ideal downward tilt angle: 30–45° toward the exercise zone.',
          'For ceiling-mounted units, use an adjustable arm bracket (included in Pro/Enterprise kits).',
          'The subject\'s full body — crown of head to ankle — must be visible at the exercise start position.'
        ]
      },
      {
        type: 'highlight',
        title: 'Zone-Specific Guidance',
        items: [
          'Squat Rack: Mount at a 45° side angle to clearly track hip crease depth and knee-over-toe alignment.',
          'Deadlift Platform: Lateral view at hip height. Sagittal plane visibility is critical for spine neutrality checks.',
          'Bicep / Shoulder Station: Front-facing camera works best. Captures elbow flexion angle at full range.',
          'Free Weight Floor: Overhead fisheye cameras (90°+ FOV) provide full coverage for multi-person environments.'
        ]
      },
      {
        type: 'callout',
        variant: 'warning',
        content: 'Avoid placing cameras directly behind strong backlit windows. This creates silhouette effects that reduce keypoint confidence scores below the 0.5 threshold required for form scoring.'
      }
    ]
  },
  'Edge Device Config': {
    heading: 'Edge Device Configuration',
    badges: ['Admin', 'Advanced'],
    sections: [
      {
        type: 'text',
        content: 'After hardware registration, the FitFix Admin Portal provides full remote configuration for each edge node. Most settings auto-configure during calibration, but advanced operators can override defaults.'
      },
      {
        type: 'highlight',
        title: 'Key Configuration Parameters',
        items: [
          'inference_resolution: Target frame resolution for the YOLO model. Default: 640×480. Increase to 1280×720 for higher accuracy at the cost of ~5ms latency.',
          'confidence_threshold: Minimum keypoint score to include in angle calculation. Default: 0.5. Lower for darker environments.',
          'rep_buffer_ms: Dead-zone buffer after a rep is counted to prevent double-counting. Default: 300ms.',
          'form_alert_cooldown_ms: Minimum time between auditory form alerts. Default: 2000ms.',
          'sync_interval_sec: How often aggregated session data is pushed to the cloud. Default: 30s.'
        ]
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'All configuration changes are applied remotely and take effect within 15 seconds. A device reboot is not required.'
      }
    ]
  },
  'Multi-Camera Sync': {
    heading: 'Multi-Camera Synchronization',
    badges: ['Pro', 'Enterprise'],
    sections: [
      {
        type: 'text',
        content: 'For large commercial gyms with multiple exercise zones, FitFix supports synchronized multi-camera deployments. Each camera runs on its own edge node, and all nodes report to a single gym-level aggregator.'
      },
      {
        type: 'highlight',
        title: 'Architecture',
        items: [
          'Each edge node is assigned a Zone ID from the Admin Portal (e.g., zone_squat_rack_1).',
          'A primary aggregator node (typically the Admin Node) collects session streams from all zones.',
          'Member identity is resolved by the FitFix app check-in event, not by facial recognition.',
          'A single member can move between zones. Sessions auto-merge at the zone boundary if check-out/check-in occurs within 60 seconds.'
        ]
      },
      {
        type: 'highlight',
        title: 'Network Topology Requirement',
        items: [
          'All edge nodes must be on the same local subnet for low-latency inter-node communication.',
          'The Admin Node must have outbound internet access for cloud sync.',
          'Individual zone nodes can operate in LAN-only mode — internet is not required per node.'
        ]
      }
    ]
  },
  'Calibration Guide': {
    heading: 'Calibration Guide',
    badges: ['Required', 'Post-Install'],
    sections: [
      {
        type: 'text',
        content: 'Calibration teaches the FitFix model the specific geometry of your gym zone: the floor plane, the exercise area boundaries, and the ambient lighting conditions. Run calibration after every camera re-mount.'
      },
      {
        type: 'steps',
        items: [
          { step: '01', title: 'Open Calibration Mode', desc: 'In Admin Portal → Devices → [Device Name] → tap "Run Calibration." The camera feed goes live in a calibration overlay.' },
          { step: '02', title: 'Confirm Floor Plane', desc: 'The system auto-detects the floor. Confirm the green floor-plane boundary is flush with the actual floor. Drag corners to adjust if needed.' },
          { step: '03', title: 'Full-Body Reference Scan', desc: 'A staff member or volunteer stands in the centre of the exercise zone with arms at their sides. The system captures a 5-second reference scan to calibrate scale and distance.' },
          { step: '04', title: 'Lighting Profile', desc: 'Run calibration at the same time of day the zone is most active (e.g., 6pm for evening peak). This captures the correct ambient light profile for confidence thresholds.' },
          { step: '05', title: 'Save & Activate', desc: 'Tap "Save Calibration." The device applies the new profile within 10 seconds. Run a test rep to confirm keypoints are tracking cleanly (green dots on all major joints).' }
        ]
      }
    ]
  },
  'SDK Overview': {
    heading: 'SDK Overview',
    badges: ['v1.8', 'Stable'],
    sections: [
      {
        type: 'text',
        content: 'The FitFix SDK gives developers programmatic access to session data, real-time keypoint streams, and member analytics. It is designed for gym operators who want to build custom dashboards, integrate with their existing member management software, or trigger automated workflows from biomechanical events.'
      },
      {
        type: 'highlight',
        title: 'Available SDKs',
        items: [
          'JavaScript / Node.js — npm install @fitfix/sdk',
          'Python 3.10+ — pip install fitfix-sdk',
          'REST API — Language-agnostic. See API Reference for full endpoint documentation.',
          'WebSocket Stream — Real-time keypoint data over wss://stream.fitfix.io/v1'
        ]
      },
      {
        type: 'highlight',
        title: 'Authentication',
        items: [
          'All API requests require a Bearer token from Admin Portal → Settings → API Keys.',
          'Tokens are scoped: read-only tokens for analytics integrations, write tokens for session management.',
          'Keys rotate every 90 days. Automated rotation via the /v1/auth/rotate endpoint is supported.',
          'IP allowlisting is available for Enterprise plans.'
        ]
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Rate limits: 1,000 requests/min on Pro plans. 10,000 requests/min on Enterprise. WebSocket streams have no rate limit.'
      }
    ]
  },
  'Webhook Events': {
    heading: 'Webhook Events',
    badges: ['SDK', 'Automation'],
    sections: [
      {
        type: 'text',
        content: 'FitFix can POST real-time event payloads to your server as biomechanical events occur. This enables automated workflows — from SMS coaching alerts to CRM updates on member milestones.'
      },
      {
        type: 'highlight',
        title: 'Available Events',
        items: [
          'session.started — Fires when a member begins a tracked session.',
          'session.ended — Fires with full performance summary on session completion.',
          'form.alert — Fires when a form error (e.g., hyperextension) is detected. Payload includes joint name and severity.',
          'rep.counted — Fires on every confirmed rep. Payload includes current rep count and angle at peak.',
          'member.milestone — Fires when a member crosses a rep or form-score threshold (configurable per plan).'
        ]
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Webhooks are signed with HMAC-SHA256 using your webhook secret. Always verify the X-FitFix-Signature header before processing payloads.'
      }
    ]
  },
  'Custom Exercises': {
    heading: 'Custom Exercises',
    badges: ['Enterprise', 'Advanced'],
    sections: [
      {
        type: 'text',
        content: 'Enterprise operators can define custom exercises beyond the 50+ movements in the standard library. Custom exercises require defining joint triplets, angle thresholds, and form correction messages.'
      },
      {
        type: 'highlight',
        title: 'Configuration Parameters',
        items: [
          'target_joints: Array of three joint names forming the angle triangle. e.g., ["left_hip", "left_knee", "left_ankle"]',
          'thresholds.min: Angle in degrees considered "bottom of rep." e.g., 70',
          'thresholds.max: Angle in degrees considered "top of rep." e.g., 170',
          'form_rules: Array of {angle_range, message, severity} objects for real-time feedback.',
          'display_name: Human-readable name shown on the member HUD.'
        ]
      },
      {
        type: 'callout',
        variant: 'warning',
        content: 'Custom exercises are validated by our biomechanics team before activation to prevent unsafe angle thresholds that could lead to injury misclassification.'
      }
    ]
  },
  'Member Data Export': {
    heading: 'Member Data Export',
    badges: ['GDPR', 'Admin'],
    sections: [
      {
        type: 'text',
        content: 'FitFix provides full data portability for gym operators and their members. All session data, keypoint aggregates, and form scores can be exported in JSON or CSV format.'
      },
      {
        type: 'highlight',
        title: 'Export Options',
        items: [
          'Single Member Export: Admin Portal → Members → [Name] → Export Data. Downloads a ZIP containing all sessions in JSON and a CSV summary.',
          'Bulk Gym Export: Admin Portal → Settings → Data Export → Export All. Generates an encrypted ZIP for compliance archiving.',
          'API Export: GET /v1/members/:id/export?format=json or ?format=csv. Returns a signed download URL valid for 15 minutes.',
          'Scheduled Exports: Enterprise plans can configure weekly/monthly automated exports to an S3 bucket or SFTP endpoint.'
        ]
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'FitFix does not store raw video. Only keypoint coordinates and derived metrics are exported. Members can request full deletion under GDPR/DPDPA via the member app.'
      }
    ]
  }
};

const CalloutBox = ({ variant, content }) => {
  const styles = variant === 'warning'
    ? 'bg-yellow-400/5 border-yellow-400/30 text-yellow-300'
    : 'bg-accent/5 border-accent/30 text-accent';
  const icon = variant === 'warning' ? '⚠' : 'ℹ';
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm font-sans leading-relaxed flex gap-3 ${styles}`}>
      <span className="font-bold text-base flex-shrink-0">{icon}</span>
      <span>{content}</span>
    </div>
  );
};

export default function DocumentationPage() {
  const [activeItem, setActiveItem] = useState('Introduction');
  const content = docContent[activeItem] || docContent['Introduction'];

  const renderedSidebar = [];
  for (let i = 0; i < sidebarCategories.length; i++) {
    const cat = sidebarCategories[i];
    const renderedItems = [];
    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      renderedItems.push(
        <button
          key={j}
          onClick={() => setActiveItem(item)}
          className={`text-left w-full text-sm font-sans px-3 py-2 rounded-lg transition-all duration-200 ${
            activeItem === item
              ? 'bg-accent/10 text-accent font-bold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {item}
        </button>
      );
    }
    renderedSidebar.push(
      <div key={i} className="mb-6">
        <p className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase mb-2 px-3">{cat.title}</p>
        <div className="flex flex-col gap-0.5">{renderedItems}</div>
      </div>
    );
  }

  const renderedSections = [];
  for (let i = 0; i < content.sections.length; i++) {
    const sec = content.sections[i];
    if (sec.type === 'text') {
      renderedSections.push(
        <p key={i} className="text-gray-300 font-sans text-sm leading-relaxed">{sec.content}</p>
      );
    } else if (sec.type === 'highlight') {
      const bulletItems = [];
      for (let j = 0; j < sec.items.length; j++) {
        bulletItems.push(
          <li key={j} className="flex gap-3 text-sm font-sans text-gray-300 leading-relaxed">
            <span className="text-accent flex-shrink-0 mt-0.5">›</span>
            <span>{sec.items[j]}</span>
          </li>
        );
      }
      renderedSections.push(
        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-extrabold tracking-widest text-gray-500 uppercase mb-4">{sec.title}</p>
          <ul className="flex flex-col gap-3">{bulletItems}</ul>
        </div>
      );
    } else if (sec.type === 'steps') {
      const stepItems = [];
      for (let j = 0; j < sec.items.length; j++) {
        const s = sec.items[j];
        stepItems.push(
          <div key={j} className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-black text-xs">{s.step}</div>
            <div>
              <p className="text-white font-bold font-sans text-sm mb-1">{s.title}</p>
              <p className="text-gray-400 font-sans text-sm leading-relaxed">{s.desc}</p>
            </div>
          </div>
        );
      }
      renderedSections.push(
        <div key={i} className="flex flex-col gap-6">{stepItems}</div>
      );
    } else if (sec.type === 'callout') {
      renderedSections.push(<CalloutBox key={i} variant={sec.variant} content={sec.content} />);
    }
  }

  const renderedBadges = [];
  if (content.badges) {
    for (let i = 0; i < content.badges.length; i++) {
      renderedBadges.push(
        <span key={i} className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-full text-[10px] font-bold tracking-widest">{content.badges[i]}</span>
      );
    }
  }

  return (
    <div className="w-full py-12">
      <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="glass rounded-2xl p-4 border border-white/5 sticky top-24">
            <p className="text-[10px] font-extrabold tracking-widest text-accent uppercase mb-5 px-3">Documentation</p>
            {renderedSidebar}
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <motion.div
            key={activeItem}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl border border-white/5 p-10 flex flex-col gap-7"
          >
            <div>
              <div className="flex flex-wrap gap-2 mb-4">{renderedBadges}</div>
              <h1 className="text-3xl font-black font-sans text-white">{content.heading}</h1>
            </div>
            {renderedSections}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
