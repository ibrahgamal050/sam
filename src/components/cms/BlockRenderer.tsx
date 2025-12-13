import "server-only";
import React from "react";
import type { AnyBlock } from "@/types/blocks";
import { blocksRegistry } from "./registry";

type RegistryFn = (b: AnyBlock) => Promise<JSX.Element> | JSX.Element;

export default async function BlockRenderer({ blocks }: { blocks: AnyBlock[] }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  const out = await Promise.all(
    blocks.map(async (b, i) => {
      const Comp = blocksRegistry[b.type] as RegistryFn | undefined;

      if (!Comp) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[BlockRenderer] Unknown block type: ${b.type}`, b);
        }
        return null;
      }

      try {
        const element = await Comp(b);
        return (
          <section
            key={b.id ?? `${b.type}-${i}`}
            data-block={b.type}
            data-block-id={b.id ?? ""}
          >
            {element}
          </section>
        );
      } catch (err) {
        console.error(`[BlockRenderer] Failed to render "${b.type}"`, err);
        return process.env.NODE_ENV !== "production" ? (
          <div
            key={b.id ?? `${b.type}-${i}`}
            className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded"
          >
            Failed to render block: <code>{b.type}</code>
          </div>
        ) : null;
      }
    })
  );

  return <>{out}</>;
}
