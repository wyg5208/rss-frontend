"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/subscribe", label: "阅读管理", icon: Compass },
  { href: "/me", label: "我的", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  // 文章详情页不显示底部导航
  if (pathname.startsWith('/article/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-12">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={["flex flex-col items-center justify-center flex-1 h-full transition-colors", active ? "text-red-500" : "text-gray-500"].join(" ")}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.5} />
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}