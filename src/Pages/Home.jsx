import React from 'react'
import Stories from '@/Components/Story'
import StoriesData from '../Data/StoriesData.js'

function Home() {
    return (
        <main className="min-h-screen min-w-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full">
                <h1 className="text-3xl text-center font-bold mb-2 text-gray-800 ">
                    Stories
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Tap on a story to view
                </p>
                <p className="text-center italic text-red-400">
                    Note: if mobile mode- scroll it horizontally
                </p>
                <div className="bg-white  rounded-xl shadow-lg p-6">
                    <Stories data={StoriesData} />
                </div>
            </div>
        </main>
    )
}

export default Home
