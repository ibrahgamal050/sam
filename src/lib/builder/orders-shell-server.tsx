import type { ReactNode } from "react"
import type { BuilderRenderOptions, Section } from "./types"
import { OrdersShell, type OrdersUIItem } from "./orders-shell"

export function renderOrdersShellSection(_section: Section, options?: BuilderRenderOptions): ReactNode {
  const orders = (options?.dataSources as any)?.orders as OrdersUIItem[] | undefined
  const restaurantName =
    (options?.dataSources as any)?.restaurant?.name?.ar ??
    (options?.dataSources as any)?.restaurant?.name?.en ??
    "مطعمنا"

  return <OrdersShell restaurantName={restaurantName} orders={orders ?? []} />
}
