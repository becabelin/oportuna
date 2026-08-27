"use client";

import { ChavesAdmin } from "@/components/chaves-admin";
import { FontesManager } from "@/components/fontes-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminBaseTabs() {
  return (
    <Tabs defaultValue="fontes" className="mt-8 min-w-0 gap-6">
      <TabsList className="grid h-12 w-full min-w-0 grid-cols-2 items-stretch">
        <TabsTrigger value="fontes" className="h-full px-3">
          Fontes
        </TabsTrigger>
        <TabsTrigger value="chaves" className="h-full px-3">
          Chaves da API
        </TabsTrigger>
      </TabsList>
      <TabsContent value="fontes" className="min-w-0">
        <FontesManager />
      </TabsContent>
      <TabsContent value="chaves" className="min-w-0">
        <ChavesAdmin />
      </TabsContent>
    </Tabs>
  );
}
