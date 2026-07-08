import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children, searchPlaceholder, onSearch }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="bg-surface-base text-on-surface antialiased min-h-screen">
      <Sidebar open={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <main className="md:ml-[240px] min-h-screen">
        <TopBar
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          onMenuClick={() => setMenuAbierto(true)}
        />
        <div className="p-4 md:p-gutter space-y-4 md:space-y-stack-lg max-w-container-max mx-auto">{children}</div>
      </main>
    </div>
  );
}
