'use client';

import Link from 'next/link';
import { Zap, Code2, MessageCircle, Headphones } from 'lucide-react';

const footerLinks = {
  Store: [
    { label: 'Browse Games', href: '/' },
    { label: 'New Releases', href: '/?sortBy=newest' },
    { label: 'Featured', href: '/?featured=true' },
  ],
  Account: [
    { label: 'My Library', href: '/library' },
    { label: 'Profile', href: '/profile' },
    { label: 'Order History', href: '/profile?tab=orders' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-secondary)',
      padding: '3rem 0 2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(3, auto)',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.875rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'var(--accent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 16px var(--accent-glow)',
              }}>
                <Zap size={16} />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Bust
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 260, lineHeight: 1.7 }}>
              Your ultimate digital game marketplace. Discover, purchase, and play thousands of games.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[Code2, MessageCircle, Headphones].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--purple-100)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  transition: 'var(--transition-fast)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--purple-100)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.875rem',
              }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      transition: 'color var(--transition-fast)',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-lighter)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          <span>© {new Date().getFullYear()} Bust Digital Marketplace. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              padding: '0.2rem 0.625rem',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}>
              BETA
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
