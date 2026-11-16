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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-[#0f172a] shadow-2xl z-10">
        <div className="absolute top-2 right-2 z-20">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>
        <Sidebar onNavClick={onClose} className="w-full border-r-0" />
      </div>
    </div>
  );
}
