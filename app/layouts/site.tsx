import { Outlet } from "react-router";

export default function SiteLayout() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Outlet />
    </div>
  );
}
