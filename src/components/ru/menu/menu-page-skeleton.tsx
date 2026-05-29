export function MenuPageSkeleton() {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4" aria-busy="true" aria-label="Loading menu content">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-32 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </div>
  
        <div className="sticky top-0 z-10 bg-white pb-2">
          <div className="flex space-x-4 pb-2 border-b border-gray-200 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-100 rounded-md animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>
  
        <div className="mt-6">
          <div className="h-6 w-32 bg-gray-100 rounded-md animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-32 w-full bg-gray-100"></div>
                <div className="p-3">
                  <div className="h-4 w-3/4 bg-gray-100 rounded-md mb-2"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded-md mb-3"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-16 bg-gray-100 rounded-md"></div>
                    <div className="h-7 w-7 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  