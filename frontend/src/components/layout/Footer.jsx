import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/finallogo.png';

// Links either anchor within the landing page (href) or route via
// react-router (path). Only real anchors/routes — nothing dead-ends.
const footerColumns = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'How it works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Book a walkthrough', href: '#walkthrough' },
      { name: 'Pricing plans', path: '/pricing' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'Login', path: '/login' },
      { name: 'fitfix@gmail.com', href: 'mailto:fitfix@gmail.com' },
      { name: '+91 81468 30484', href: 'tel:+918146830484' }
    ]
  }
];

const socialLinks = [
  {
    name: 'X (Twitter)',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.265 5.636 5.899-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    name: 'YouTube',
    path: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

const Footer = () => {
  const linkClassName =
    'text-[var(--text-muted)] hover:text-accent transition-colors duration-200 text-sm font-sans';

  const renderedColumns = [];

  for (let i = 0; i < footerColumns.length; i++) {
    const col = footerColumns[i];
    const renderedLinks = [];

    for (let j = 0; j < col.links.length; j++) {
      const link = col.links[j];
      renderedLinks.push(
        <li key={j}>
          {link.path ? (
            <Link to={link.path} className={linkClassName}>
              {link.name}
            </Link>
          ) : (
            <a href={link.href} className={linkClassName}>
              {link.name}
            </a>
          )}
        </li>
      );
    }

    renderedColumns.push(
      <div key={i} className="flex flex-col gap-4">
        <h4 className="text-text font-extrabold tracking-widest text-xs font-sans uppercase">{col.title}</h4>
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {renderedLinks}
        </ul>
      </div>
    );
  }

  const renderedSocials = [];
  for (let i = 0; i < socialLinks.length; i++) {
    const s = socialLinks[i];
    renderedSocials.push(
      <a
        key={i}
        href={s.path}
        aria-label={s.name}
        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-accent hover:border-accent transition-all duration-200"
      >
        {s.icon}
      </a>
    );
  }

  return (
    <footer className="w-full border-t border-white/5 bg-black/60 mt-auto z-10 relative pt-16 pb-8" style={{ backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-8 w-full">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={logo}
                alt="FitFix"
                style={{ height: '60px', width: 'auto', objectFit: 'contain', opacity: 0.8 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#00E5FF', fontFamily: 'Google Sans, Outfit, sans-serif', letterSpacing: '-0.02em' }}>FitFix</span>
                <span style={{ fontSize: '7px', fontWeight: 800, letterSpacing: '3px', color: '#8892b0', textTransform: 'uppercase', marginTop: '3px' }}>Pose Intelligence</span>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-sm font-sans leading-relaxed">
              Camera-based form intelligence for commercial gyms. Video never leaves the building &mdash; only the numbers do.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {renderedSocials}
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {renderedColumns}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--text-muted)] text-xs font-sans">© 2026 FitFix Inc. All rights reserved.</p>
          <p className="text-[var(--text-muted)] text-xs font-sans opacity-80">Built for Commercial Floors · Powered by Edge AI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
