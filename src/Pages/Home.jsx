import React from 'react'
import Stories from '@/Components/Story'
import StoriesData from "../Data/StoriesData.js";

function Home() {
   return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Stories</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Tap on a story to view</p>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <Stories data={StoriesData} />
        </div>
      </div>
    </main>
  )
}

export default Home
