import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-48" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-52 w-full" rounded="lg" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-52 w-full" rounded="lg" />
        </div>
      </div>

      <SkeletonCard rows={4} />
    </div>
  )
}
