"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

const ThemeContext = React.createContext<{
  theme: Theme | string
  setTheme: (theme: Theme | string) => void
  resolvedTheme: string
} | null>(null)

export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
  const getInitialTheme = () => {
    if (typeof window === "undefined") return defaultTheme

    const saved = window.localStorage.getItem("theme")
    if (saved === "dark" || saved === "light" || saved === "system") {
      return saved
    }

    return defaultTheme
  }

  const getInitialResolvedTheme = (initialTheme: Theme | string) => {
    if (typeof window === "undefined") return initialTheme === "dark" ? "dark" : "light"

    if (initialTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    return initialTheme
  }

  const [theme, setThemeState] = React.useState<Theme | string>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<string>(() => getInitialResolvedTheme(getInitialTheme()))

  React.useEffect(() => {
    const root = window.document.documentElement

    let active = theme
    if (theme === "system") {
      active = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    queueMicrotask(() => setResolvedTheme(active))

    root.classList.remove("light", "dark")
    if (active === "dark" || active === "light") {
      root.classList.add(active)
    }
    window.localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}