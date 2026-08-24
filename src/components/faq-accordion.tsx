"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/lib/faq";

export function FaqAccordion() {
  return (
    <Accordion className="max-w-3xl">
      {FAQ.map((item, index) => (
        <AccordionItem key={item.q} value={`faq-${index}`}>
          <AccordionTrigger className="py-5 font-heading text-lg hover:no-underline sm:py-6 sm:text-xl">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
