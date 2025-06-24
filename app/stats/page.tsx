"use client"

import { TrainingStats } from "@/components/training-stats"
import { Navigation } from "@/components/navigation"
import { useTrainingData } from "@/hooks/use-training-data"

export default function StatsPage() {
  const { trainingData } = useTrainingData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">训练统计</h1>
          <p className="text-gray-600">分析你的训练数据和趋势</p>
          {/* 数据状态指示器 */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">数据实时更新</span>
          </div>
        </div>

        <TrainingStats trainingData={trainingData} />
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
