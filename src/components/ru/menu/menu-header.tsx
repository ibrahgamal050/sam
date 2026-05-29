interface MenuHeaderProps {
  menuName: string
  categoriesCount: number
  itemsCount: number
}

export function MenuHeader({ menuName, categoriesCount, itemsCount }: MenuHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-white via-[#f8f3ff] to-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,92,231,0.12),_transparent_70%)]" />
      <div className="relative flex flex-col gap-4 text-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#6c5ce7]/10 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7]">
            Наше меню
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{menuName || "Меню"}</h1>
          <p className="max-w-2xl text-sm leading-6 text-gray-600">
            Откройте для себя нашу подборку блюд: просматривайте по категориям или ищите любимое блюдо напрямую.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Категорий</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{categoriesCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Всего блюд</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{itemsCount}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
