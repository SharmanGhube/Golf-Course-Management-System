'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-6">
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
