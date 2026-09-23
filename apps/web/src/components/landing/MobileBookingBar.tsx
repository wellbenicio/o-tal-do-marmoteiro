"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
export function MobileBookingBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let heroVisible = true,
      closingVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.classList.contains("hero"))
          heroVisible = entry.isIntersecting;
        if (entry.target.classList.contains("closing-section"))
          closingVisible = entry.isIntersecting;
      }
      setVisible(!heroVisible && !closingVisible);
    });
    for (const selector of [".hero", ".closing-section"]) {
      const el = document.querySelector(selector);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return visible ? (
    <div className="mobile-booking-bar">
      <span>
        Um momento só seu<strong>30 min · R$ 70</strong>
      </span>
      <Link href="/agendar">
        Ver horários <ArrowUpRight size={16} />
      </Link>
    </div>
  ) : null;
}
