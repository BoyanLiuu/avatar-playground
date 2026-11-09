import { CustomizeSheet } from "@/components/shell/customize-sheet";
import { TopBand } from "@/components/shell/top-band";
import { getStyle, partsOf } from "@/content/styles";
import fixtures from "@/fixtures/fixtures.json";

// M1.1: the app frame. The regions fill in over M1.2 (style list), M1.3 (stage) and M1.4
// (customize panel).
export default function Home() {
  const style = getStyle("flat");
  const fx = fixtures.flat;
  const subtitle = `${style.name} · ${partsOf(style).length} parts`;
  const panelBody = (
    <p className="py-4 text-[12.5px] text-graphite">
      The parts of {style.name} appear here in M1.4.
    </p>
  );

  return (
    <div className="flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <TopBand />
      <main className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav
          aria-label="Styles"
          className="hidden w-[232px] shrink-0 flex-col gap-1 border-r border-rule px-3 pt-5 pb-4 sm:flex xl:w-[264px]"
        >
          <h2 className="edge-label px-2 pb-2">Styles</h2>
        </nav>

        <section
          aria-label="Avatar"
          className="relative flex min-w-0 flex-1 flex-col items-center px-6 pt-5 pb-4 max-sm:px-4"
        >
          <div className="flex h-8 w-full items-center justify-between gap-3">
            <span className="edge-label">
              Frame <b className="font-bold text-ink">{fx.frameNo}</b> · seed{" "}
              {fx.seed}
            </span>
            <CustomizeSheet
              side="right"
              subtitle={subtitle}
              className="max-sm:hidden xl:hidden"
            >
              {panelBody}
            </CustomizeSheet>
            <CustomizeSheet
              side="bottom"
              subtitle={subtitle}
              className="sm:hidden"
            >
              {panelBody}
            </CustomizeSheet>
          </div>
        </section>

        <aside
          aria-label="Customize"
          className="hidden w-[424px] shrink-0 flex-col border-l border-rule bg-panel xl:flex"
        >
          <div className="border-b border-rule px-5 py-3">
            <h2 className="text-[17px] leading-tight font-semibold">
              Customize
            </h2>
            <p className="mt-0.5 text-[12.5px] text-graphite">{subtitle}</p>
          </div>
          <div className="px-5">{panelBody}</div>
        </aside>
      </main>
    </div>
  );
}
