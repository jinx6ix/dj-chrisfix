"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavbarClientProps {
  artistName: string;
}

export function NavbarClient({ artistName }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key, outside click, and handle body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/mixes", label: "Mixes" },
    { href: "/events", label: "Events" },
    { href: "/videos", label: "Videos" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/bookings", label: "Book", highlight: true },
  ];

  return (
    <>
      {/* Backdrop overlay to obscure background content when mobile menu is open */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <header ref={navRef} className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between px-5 py-3 relative z-50 text-white">
        <Link href="/" className="font-semibold tracking-tight text-white hover:text-amber-400 transition-colors">
          {artistName}
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-5 text-sm font-medium text-white/90">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  link.highlight
                    ? "btn py-1.5 px-4 text-xs font-semibold text-[#1a1205] bg-[#ff9f43] hover:opacity-90"
                    : isActive
                    ? "text-white font-semibold underline underline-offset-4 decoration-[#ff9f43]"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close main menu" : "Open main menu"}
          className="md:hidden p-2 rounded-lg text-white hover:text-amber-400 hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#ff9f43]"
        >
          {isOpen ? <X className="w-6 h-6 text-[#ff9f43]" /> : <Menu className="w-6 h-6 text-white" />}
        </button>

        {/* Mobile Drawer / Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 px-5 pb-6 pt-4 glass md:hidden border border-white/25 bg-[#121218]/98 backdrop-blur-2xl shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-2 duration-250 z-50">
            <nav id="mobile-navigation" aria-label="Mobile" className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between text-white ${
                      link.highlight
                        ? "btn w-full justify-center mt-2 text-center text-[#1a1205] bg-[#ff9f43] hover:opacity-90 py-2.5 font-bold"
                        : isActive
                        ? "bg-white/15 text-white font-semibold border border-white/20 pl-5"
                        : "text-zinc-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && !link.highlight && <span className="w-2 h-2 rounded-full bg-[#ff9f43]"></span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
