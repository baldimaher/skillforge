'use client';

import './globals.css';

import { AppSidebar } from '@/components/app-sidebar';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TopNav } from '@/components/top-nav';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/signup';

  return (
    <html lang="fr">
      <body className={inter.className}>
        {isPublicPage ? (
          <main>{children}</main>
        ) : (
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <TopNav />
                <main className="flex-1 p-6 bg-slate-50/50">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}