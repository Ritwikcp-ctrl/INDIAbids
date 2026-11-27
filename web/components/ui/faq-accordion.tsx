"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: "What is Vengeance UI?", answer: "Vengeance UI is a high-performance, dark-mode first component library designed for the next generation of web applications." },
  { question: "Can I use it with Tailwind CSS?", answer: "Yes! All components are built on top of Tailwind CSS and highly customizable using utility classes." },
  { question: "Are the components accessible?", answer: "Accessibility is a core focus. We ensure proper ARIA attributes, keyboard navigation, and semantic HTML structure." },
  { question: "Do I need to install a heavy npm package?", answer: "No. Vengeance UI provides a CLI that lets you copy and paste only the components you need directly into your project." },
  { question: "Is it compatible with React and Next.js?", answer: "Absolutely. The library is built with React in mind and perfectly supports Next.js Server Components and client-side rendering." },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Vengeance UI FAQs",
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto py-8 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-center font-bold text-2xl md:text-3xl mb-10 text-neutral-500 dark:text-neutral-400">
          {title}
        </h2>
      )}
      
      <ul className="w-full mx-auto list-none p-0 flex flex-col">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b border-border",
                "last:border-b-0"
              )}
            >
              <button
                type="button"
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[58px] py-4 relative m-0 px-4 pl-14 cursor-pointer",
                  "border-l-[6px] md:border-l-[8px] transition-colors duration-200 text-left outline-none text-sm md:text-base",
                  isActive 
                    ? "border-l-[#FF4D1F] bg-[#FF4D1F]/[0.07] dark:bg-[#FF4D1F]/[0.09] text-foreground font-semibold" 
                    : "border-l-border bg-transparent text-muted-foreground hover:border-l-[#FF4D1F]/60 hover:text-foreground hover:bg-card/60"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span 
                  className={cn(
                    "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none",
                    isActive ? "text-[28px] md:text-[34px] font-normal text-[#FF4D1F]" : "text-[22px] md:text-[26px] font-normal text-muted-foreground"
                  )}
                >
                  {isActive ? "-" : "+"}
                </span>
                
                <span className="pr-8">{item.question}</span>
                
                {/* Chevron */}
                <span 
                  className={cn(
                    "absolute right-6 block w-2 h-2 border-t-[2.5px] border-r-[2.5px] transition-transform duration-200 ease-in-out",
                    isActive ? "rotate-[-44deg] border-[#FF4D1F]" : "rotate-[133deg] border-muted-foreground"
                  )}
                />
              </button>

              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px] md:border-l-[8px]",
                  isActive ? "grid-rows-[1fr] border-l-[#FF4D1F] bg-[#FF4D1F]/[0.05] dark:bg-[#FF4D1F]/[0.07]" : "grid-rows-[0fr] border-l-border bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-14 pb-5 pt-1 text-xs md:text-sm font-normal text-muted-foreground leading-relaxed">
                    <span>{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
