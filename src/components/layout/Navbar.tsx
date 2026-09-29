'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Menu,
  X,
  Trophy,
  Plus,
  Film,
  Home,
  Compass,
} from 'lucide-react';
import { QuizLogo } from '../ui/QuizLogo';
import { CATEGORY_NAV_ITEMS, CategoryNav } from './CategoryNav';

export function Navbar() {
  const {
    setCurrentView,
    room,
    currentPlayer,
    joinRoom,
    setIsJoinModalOpen,
    setIsGlobalLeaderboardOpen,
    setIsCreateModalOpen,
    setSelectedCategoryId,
  } = useGame();
  const {
    currentUser,
    setIsSettingsModalOpen,
    openAuthModal,
    logout,
  } = useAuth();

  const [desktopPin, setDesktopPin] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('start');

  const handleDesktopJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopPin.trim()) return;
    const cleanPin = desktopPin.replace(/\s+/g, '').toUpperCase();
    const username = currentUser?.username || 'PlayerOne';
    joinRoom(cleanPin, username);
  };

  const handleDesktopPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (raw.length > 6) raw = raw.slice(0, 6);
    if (raw.length > 3) {
      setDesktopPin(`${raw.slice(0, 3)} ${raw.slice(3)}`);
    } else {
      setDesktopPin(raw);
    }
  };

  const handleMobileCategoryClick = (item: (typeof CATEGORY_NAV_ITEMS)[0]) => {
    setActiveCategory(item.id);
    if (item.id === 'start') {
      setCurrentView('landing');
    } else if (item.categoryId) {
      setSelectedCategoryId(item.categoryId);
      setCurrentView('topics');
    }
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF4] border-b border-[#CECCC5] transition-colors">
        <div className="max-w-[1248px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => setCurrentView('landing')}
            className="focus:outline-none shrink-0 cursor-pointer"
          >
            <QuizLogo />
          </button>

          {/* Desktop: Salmon PIN Join Band */}
          <div className="hidden lg:flex items-center">
            <form
              onSubmit={handleDesktopJoin}
              className="flex items-center gap-3 bg-[#FFA7A0] px-4 py-1.5 rounded-xl border border-black/10 shadow-sm"
            >
              <div className="flex flex-col font-nunito text-xs font-black text-black leading-none whitespace-nowrap">
                <span>Join Game?</span>
                <span className="opacity-80">Enter PIN:</span>
              </div>
              <input
                type="text"
                placeholder="123 456"
                maxLength={7}
                value={desktopPin}
                onChange={handleDesktopPinChange}
                onClick={() => setIsJoinModalOpen(true)}
                className="w-28 text-center font-nunito font-extrabold text-sm rounded-full py-1 px-2 bg-white text-black border-2 border-black focus:outline-none shadow-inner tracking-wider"
              />
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Active room live badge */}
            {room && currentPlayer && (
              <button
                onClick={() => setCurrentView(room.status === 'LOBBY' ? 'lobby' : 'game')}
                className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-nunito font-bold rounded-full cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#4CA471] animate-pulse" />
                <span>{room.code}</span>
              </button>
            )}

            {/* Search — desktop only */}
            <button
              type="button"
              onClick={() => setCurrentView('categories')}
              className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5E3DB] hover:bg-black/10 items-center justify-center text-black transition-colors cursor-pointer border border-[#CECCC5]"
              title="Search quizzes"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Rankings — desktop only */}
            <button
              type="button"
              onClick={() => setIsGlobalLeaderboardOpen(true)}
              className="hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5E3DB] hover:bg-black/10 items-center justify-center text-black transition-colors cursor-pointer border border-[#CECCC5]"
              title="Rankings"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User Profile or Clear Log In / Sign Up buttons */}
            {currentUser ? (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#E5E3DB] hover:bg-black/10 border border-[#CECCC5] cursor-pointer transition-colors"
                title={`${currentUser.username} (Settings)`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-black/30">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-nunito font-extrabold text-xs text-black max-w-[80px] sm:max-w-[100px] truncate">
                  {currentUser.username}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3 sm:px-4 py-1.5 rounded-full font-nunito font-bold text-xs sm:text-sm text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="px-3 sm:px-4 py-1.5 rounded-full font-nunito font-black text-xs sm:text-sm bg-black hover:bg-black/80 text-white shadow-sm transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger — opens side drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-full bg-[#E5E3DB] hover:bg-black/10 flex items-center justify-center text-black transition-colors cursor-pointer border border-[#CECCC5]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Category Sub-nav (second row, desktop only) */}
        <div className="hidden md:block border-t border-[#CECCC5] bg-[#FFFDF4]">
          <div className="max-w-[1248px] mx-auto px-4 md:px-6">
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={(id) => setActiveCategory(id)}
            />
          </div>
        </div>
      </header>

      {/* ── Mobile Side Drawer Overlay ── */}
      <div
        className={`fixed inset-0 z-50 md:hidden pointer-events-none ${mobileMenuOpen ? 'pointer-events-auto' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />

        {/* Drawer Panel — slides in from right */}
        <div
          className={`absolute right-0 top-0 h-full w-[290px] max-w-[85vw] bg-[#FFFDF4] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#CECCC5] shrink-0">
            <QuizLogo />
            <button
              type="button"
              onClick={closeMobileMenu}
              className="w-9 h-9 rounded-full bg-[#E5E3DB] flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Drawer Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4">

            {/* Mobile Auth Status Card */}
            <div className="p-3 mb-4 rounded-xl bg-[#E5E3DB] border border-[#CECCC5]">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => { setIsSettingsModalOpen(true); closeMobileMenu(); }}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-black">
                      <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-nunito font-extrabold text-sm text-black">{currentUser.username}</p>
                      <p className="text-[11px] text-[#595955]">Account Settings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="text-xs font-nunito font-bold text-red-600 hover:underline px-2 py-1"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="font-nunito font-extrabold text-xs text-[#595955] text-center">
                    Sign in to track scores & compete
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { openAuthModal('login'); closeMobileMenu(); }}
                      className="w-full py-2 rounded-lg bg-white border border-black/20 text-black font-nunito font-bold text-xs text-center hover:bg-black/5"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => { openAuthModal('register'); closeMobileMenu(); }}
                      className="w-full py-2 rounded-lg bg-black text-white font-nunito font-black text-xs text-center hover:bg-black/80"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Section */}
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#595955] px-2 pb-2">
              Categories
            </p>
            <div className="space-y-1">
              {CATEGORY_NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMobileCategoryClick(item)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer font-nunito font-bold text-sm ${
                    activeCategory === item.id
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-[#E5E3DB]'
                  }`}
                >
                  <div className={`w-5 h-5 shrink-0 ${activeCategory === item.id ? 'text-white' : 'text-black'}`}>
                    {item.iconSvg}
                  </div>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#CECCC5] my-4" />

            {/* Navigation Section */}
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#595955] px-2 pb-2">
              Navigation
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => { setCurrentView('landing'); closeMobileMenu(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer font-nunito font-bold text-sm"
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => { setCurrentView('entertainment'); closeMobileMenu(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer font-nunito font-bold text-sm"
              >
                <Film className="w-5 h-5 shrink-0" />
                <span>Entertainment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('categories');
                  closeMobileMenu();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer font-nunito font-bold text-sm"
              >
                <Compass className="w-5 h-5 shrink-0" />
                <span>All Categories</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsGlobalLeaderboardOpen(true);
                  closeMobileMenu();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer font-nunito font-bold text-sm"
              >
                <Trophy className="w-5 h-5 shrink-0" />
                <span>Rankings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('categories');
                  closeMobileMenu();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-black hover:bg-[#E5E3DB] transition-colors cursor-pointer font-nunito font-bold text-sm"
              >
                <Search className="w-5 h-5 shrink-0" />
                <span>Search Quizzes</span>
              </button>
            </div>
          </div>

          {/* Drawer Footer — Create Quiz CTA */}
          <div className="p-4 border-t border-[#CECCC5] shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(true);
                closeMobileMenu();
              }}
              className="w-full h-11 bg-black text-white font-nunito font-black text-sm rounded-full flex items-center justify-center gap-2 hover:bg-black/80 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
