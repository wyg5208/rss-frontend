"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">出了点问题</h2>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button onClick={reset} className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm">重试</button>
        </div>
      </body>
    </html>
  );
}
