import Order from "@/models/order"

function yymmdd(d = new Date()) {
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yy}${mm}${dd}`
}

function rand6() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function generateOrderNumberRandom(restaurantId: string) {
  const prefix = yymmdd()
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = `${prefix}-${rand6()}`
    const exists = await Order.exists({ restaurantId, orderNumber })
    if (!exists) return orderNumber
  }
  throw new Error("Failed to generate unique orderNumber")
}
 