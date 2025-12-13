import { headers } from "next/headers"
import type { IRestaurant } from "@/types/restaurant"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import { splitHostAndPort } from "@/lib/host-utils"

export type RestaurantRequestContext = {
  restaurant: IRestaurant | null
  hostHeader: string
  hostname: string
  port: string | null
}

export async function resolveRestaurantFromHeaders(): Promise<RestaurantRequestContext> {
  const headersList = await headers()
  const hostHeader = headersList.get("host") ?? ""
  const { host: hostname, port } = splitHostAndPort(hostHeader)
  const restaurant = await getRestaurantByHost(hostname)

  return {
    restaurant,
    hostHeader,
    hostname,
    port,
  }
}
