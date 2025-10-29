export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
