"use client";

import { ChavesAdmin } from "@/components/chaves-admin";
import { FontesManager } from "@/components/fontes-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminBaseTabs() {
  return (
    <Tabs defaultValue="fontes" className="mt-8 min-w-0 gap-6">
      <TabsList className="h-auto w-full min-w-0">
        <TabsTrigger value="fontes" className="min-h-11 flex-1 px-3">
          Fontes
        </TabsTrigger>
        <TabsTrigger value="chaves" className="min-h-11 flex-1 px-3">
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
