import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children, searchPlaceholder, onSearch }) {
  return (
    <div className="bg-surface-base text-on-surface antialiased min-h-screen">
      <Sidebar />
      <main className="ml-[240px] min-h-screen">
        <TopBar searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
        <div className="p-gutter space-y-stack-lg max-w-container-max mx-auto">{children}</div>
      </main>
    </div>
  );
}
