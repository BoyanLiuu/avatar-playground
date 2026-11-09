import { SetupCheck } from "@/components/setup-check";

// M0 placeholder: replaced by the playground shell in M2.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Avatar Playground
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          M0 setup check: shadcn/ui on the dark theme.
        </p>
      </div>
      <SetupCheck />
    </main>
  );
}
