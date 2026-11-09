"use client";

import { DicesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export const SetupCheck = () => (
  <Button size="lg" onClick={() => toast("Randomize arrives in M2")}>
    <DicesIcon data-icon="inline-start" />
    Randomize
    <Kbd>Space</Kbd>
  </Button>
);
