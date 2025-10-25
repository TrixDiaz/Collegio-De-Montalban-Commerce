import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationDropdown } from '@/components/notification-dropdown';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Welcome back, {user?.name}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
