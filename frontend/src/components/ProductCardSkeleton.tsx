export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
