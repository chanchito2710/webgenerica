export default function CategorySkeleton() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-2 sm:p-3">
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>
    </div>
  );
}
