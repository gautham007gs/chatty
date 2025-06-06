
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquareText, Users, MoreVertical } from 'lucide-react'; // Users for Status, MoreVertical for options
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Chats', href: '/', icon: <MessageSquareText size={20} /> },
    { name: 'Status', href: '/status', icon: <Users size={20} /> },
    // { name: 'Calls', href: '/calls', icon: <Phone size={20} /> }, // Example for future
  ];

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-3xl">
        <h1 className="text-xl font-semibold">{title}</h1>
        {/* Placeholder for search or more options icon if needed in future */}
        {/* <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <MoreVertical size={24} />
        </Button> */}
      </div>
      <nav className="bg-primary"> {/* Can be a slightly different shade if needed, e.g., bg-primary/90 */}
        <div className="container mx-auto flex justify-around items-center max-w-3xl">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 py-3 text-center text-sm font-medium flex flex-col items-center gap-1 transition-colors",
                pathname === item.href
                  ? 'text-primary-foreground border-b-2 border-primary-foreground/90'
                  : 'text-primary-foreground/70 hover:text-primary-foreground/90',
                "hover:bg-primary-foreground/10" 
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
