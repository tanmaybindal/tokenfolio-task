'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="size-8 cursor-pointer"
    >
      <SunIcon data-icon className="hidden dark:block" />
      <MoonIcon data-icon className="block dark:hidden" />
    </Button>
  );
}
