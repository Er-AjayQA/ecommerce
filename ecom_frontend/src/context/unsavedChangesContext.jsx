import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UnsavedChangesContext = createContext(null);

export const UnsavedChangesProvider = ({ children }) => {
  const navigate = useNavigate();

  const [enabled, setEnabled] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const pendingActionRef = useRef(null);
  const bypassRef = useRef(false);
  const historyGuardAttachedRef = useRef(false);

  const openDialog = useCallback((action) => {
    pendingActionRef.current = action || null;
    setShowDialog(true);
  }, []);

  const confirmNavigation = useCallback(
    (action) => {
      if (enabled && isDirty && !bypassRef.current) {
        openDialog(action);
        return;
      }

      if (typeof action === "function") {
        action();
      }
    },
    [enabled, isDirty, openDialog],
  );

  const clearGuard = useCallback(() => {
    setEnabled(false);
    setIsDirty(false);
    setShowDialog(false);
    pendingActionRef.current = null;
  }, []);

  const handleStay = useCallback(() => {
    setShowDialog(false);
    pendingActionRef.current = null;
  }, []);

  const handleLeave = useCallback(() => {
    const action = pendingActionRef.current;

    setShowDialog(false);
    pendingActionRef.current = null;

    bypassRef.current = true;
    setEnabled(false);
    setIsDirty(false);

    if (typeof action === "function") {
      action();
    }

    setTimeout(() => {
      bypassRef.current = false;
    }, 0);
  }, []);

  // Browser refresh / tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!enabled || !isDirty || showDialog || bypassRef.current) return;

      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, isDirty, showDialog]);

  // Intercept internal menu/link clicks globally
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!enabled || !isDirty || showDialog || bypassRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      const targetUrl = new URL(anchor.href, window.location.origin);
      const currentUrl = new URL(window.location.href);

      const isSamePage =
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash === currentUrl.hash;

      if (targetUrl.origin !== currentUrl.origin || isSamePage) return;

      e.preventDefault();

      openDialog(() => {
        navigate(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);
      });
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [enabled, isDirty, showDialog, navigate, openDialog]);

  // Intercept browser back/forward
  useEffect(() => {
    if (!enabled || !isDirty) {
      historyGuardAttachedRef.current = false;
      return;
    }

    if (!historyGuardAttachedRef.current) {
      window.history.pushState(
        { unsavedChangesGuard: true },
        "",
        window.location.href,
      );
      historyGuardAttachedRef.current = true;
    }

    const handlePopState = () => {
      if (!enabled || !isDirty || showDialog || bypassRef.current) return;

      // user ko current page par wapas rakho
      window.history.go(1);

      openDialog(() => {
        window.history.back();
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, isDirty, showDialog, openDialog]);

  const value = useMemo(
    () => ({
      setGuardEnabled: setEnabled,
      setDirtyState: setIsDirty,
      confirmNavigation,
      clearGuard,
      showDialog,
    }),
    [confirmNavigation, clearGuard, showDialog],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}

      <AlertDialog open={showDialog} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Leave page with unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Leaving this page will delete all unsaved changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStay}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave} className="bg-red-700">
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    throw new Error(
      "useUnsavedChanges must be used inside UnsavedChangesProvider",
    );
  }

  return context;
};

// Reusable helper for any form
export const useFormUnsavedChanges = ({ when = true, isDirty = false }) => {
  const { setGuardEnabled, setDirtyState, confirmNavigation, clearGuard } =
    useUnsavedChanges();

  useEffect(() => {
    setGuardEnabled(Boolean(when));
    setDirtyState(Boolean(when && isDirty));

    return () => {
      setGuardEnabled(false);
      setDirtyState(false);
    };
  }, [when, isDirty, setGuardEnabled, setDirtyState]);

  return {
    confirmNavigation,
    clearGuard,
  };
};
