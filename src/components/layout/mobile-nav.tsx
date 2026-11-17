"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // Lock body scroll when mobile nav is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      className="fixed inset-0 z-50 flex md:hidden"
    >
      {/* Backdrop with fade-in and backdrop blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container with slide-in from left */}
      <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[#0f172a] border-r border-border/80 shadow-2xl z-10 animate-in slide-in-from-left duration-250 ease-out">
        {/* Dismiss Button */}
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <Sidebar onNavClick={onClose} className="w-full border-r-0 h-full" />
      </div>
    </div>
  );
}
