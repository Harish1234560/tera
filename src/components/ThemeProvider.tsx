import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light";

/** Where the circular reveal starts. A React MouseEvent satisfies this, so
 *  <button onClick={toggleTheme}> keeps working unchanged. */
export interface ToggleOrigin {
  clientX: number;
  clientY: number;
  currentTarget?: EventTarget | null;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (origin?: ToggleOrigin) => void;
  setTheme: (theme: Theme) => void;
}

/** Set to true to lock the whole site to dark (the toggle then does nothing). */
const FORCE_DARK = false;

const KEY = "tera-theme";
const LEGACY_KEY = "dfesta-theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/* ---------- safe storage (private mode / blocked storage can throw) ---------- */
const readStored = (): Theme | null => {
  try {
    const v = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
};
const writeStored = (t: Theme) => {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
};

const initialTheme = (): Theme => {
  if (FORCE_DARK || typeof window === "undefined") return "dark";
  // system setting is ignored on purpose: first visit is always dark
  return readStored() ?? "dark";
};

/* ---------- apply to <html> ---------- */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme; // native scrollbars + form controls follow the theme

  // tint the mobile browser bar with the page background, if the CSS exposes it
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    const v = getComputedStyle(root).getPropertyValue("--background").trim();
    if (v) meta.content = /^[\d.]+\s+[\d.]+%\s+[\d.]+%/.test(v) ? `hsl(${v})` : v;
  }
};

const VT_STYLE_ID = "tera-theme-vt";
const VT_CSS = `
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }
.theme-switching, .theme-switching *, .theme-switching *::before, .theme-switching *::after { transition: none !important; }
`;

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  /* inject the transition CSS once, so no stylesheet needs editing */
  useEffect(() => {
    if (document.getElementById(VT_STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = VT_STYLE_ID;
    s.textContent = VT_CSS;
    document.head.appendChild(s);
  }, []);

  /* apply before paint, and remember the choice */
  useLayoutEffect(() => {
    applyTheme(theme);
    if (!FORCE_DARK) writeStored(theme);
  }, [theme]);

  /* keep other tabs in sync */
  useEffect(() => {
    if (FORCE_DARK) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      if (e.newValue === "dark" || e.newValue === "light") setThemeState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    if (FORCE_DARK) return;
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(
    (origin?: ToggleOrigin) => {
      if (FORCE_DARK) return;
      const next: Theme = theme === "light" ? "dark" : "light";
      const doc = document as VTDocument;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* fallback: no View Transitions API, or reduced motion */
      if (!doc.startViewTransition || reduced) {
        const root = document.documentElement;
        root.classList.add("theme-switching"); // no colour transitions mid-switch
        setThemeState(next);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => root.classList.remove("theme-switching"))
        );
        return;
      }

      /* circular reveal from the button */
      let x = origin?.clientX ?? window.innerWidth / 2;
      let y = origin?.clientY ?? window.innerHeight / 2;
      if (origin && x === 0 && y === 0 && origin.currentTarget instanceof Element) {
        // keyboard activation reports 0,0, so use the button's centre
        const r = origin.currentTarget.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        flushSync(() => setThemeState(next));
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
            },
            {
              duration: 650,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});
    },
    [theme]
  );

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};