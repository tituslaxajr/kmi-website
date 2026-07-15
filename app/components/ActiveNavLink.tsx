"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ActiveNavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return <Link className={className} href={href} aria-current={isCurrent ? "page" : undefined}>{label}</Link>;
}
