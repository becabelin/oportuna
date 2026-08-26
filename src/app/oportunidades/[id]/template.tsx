import type { ReactNode } from "react";

import { ScrollToTopOnMount } from "@/components/scroll-to-top-on-mount";

export default function OpportunityDetailTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ScrollToTopOnMount />
      {children}
    </>
  );
}
