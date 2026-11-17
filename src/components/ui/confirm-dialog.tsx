"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#111827] border border-border/80 shadow-2xl backdrop-blur-xl p-6">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                isDestructive
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-slate-300 leading-relaxed mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5 sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`font-semibold gap-1.5 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isDestructive && <Trash2 className="size-3.5" />}
                <span>{confirmLabel}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
