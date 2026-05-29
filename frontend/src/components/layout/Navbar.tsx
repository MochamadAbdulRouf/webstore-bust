'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gamepad2, ShoppingCart, Library, User, LogOut, Moon, Sun,
  Menu, X, Search, Shield, Heart, ChevronDown, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useThemeStore } from '@/store/useThemeStore';
import { getImageUrl, formatPrice } from '@/lib/utils';
import styles from './Navbar.module.css';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    useCartStore.getState().reset();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Store' },
    { href: '/library', label: 'Library' },
  ];

  const cartCount = cart?.count ?? 0;

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={18} />
          </div>
          <span>Bust</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className={styles.actions}>
          {/* Search */}
          <div className={`${styles.searchWrap} ${searchOpen ? styles.searchActive : ''}`}>
            {searchOpen ? (
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <Search size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </Link>

          {/* User Menu / Auth */}
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <img
                  src={getImageUrl(user.avatar, 'avatar')}
                  alt={user.username}
                  className={styles.avatar}
                />
                <span className={styles.username}>{user.username}</span>
                <ChevronDown size={14} className={userMenuOpen ? styles.rotated : ''} />
              </button>

              {userMenuOpen && (
                <>
                  <div className={styles.overlay} onClick={() => setUserMenuOpen(false)} />
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{user.username}</div>
                      <div className={styles.dropdownBalance}>{formatPrice(user.balance)}</div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/profile" className={styles.dropdownItem}>
                      <User size={15} /> Profile
                    </Link>
                    <Link href="/library" className={styles.dropdownItem}>
                      <Library size={15} /> My Library
                    </Link>
                    <Link href="/profile?tab=wishlist" className={styles.dropdownItem}>
                      <Heart size={15} /> Wishlist
                    </Link>
                    {user.isAdmin && (
                      <>
                        <div className={styles.dropdownDivider} />
                        <Link href="/admin" className={`${styles.dropdownItem} ${styles.adminItem}`}>
                          <Shield size={15} /> Admin Panel
                        </Link>
                      </>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`${styles.iconBtn} ${styles.mobileToggle}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className={styles.mobileLink}><User size={16} /> Profile</Link>
              <Link href="/library" className={styles.mobileLink}><Library size={16} /> Library</Link>
              {user.isAdmin && (
                <Link href="/admin" className={styles.mobileLink}><Shield size={16} /> Admin</Link>
              )}
              <button className={styles.mobileLinkBtn} onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className={styles.mobileAuth}>
              <Link href="/auth/login" className="btn btn-ghost" style={{ width: '100%' }}>Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ width: '100%' }}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
