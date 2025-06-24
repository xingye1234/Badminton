"use client"

import { useState, useEffect } from "react"
import { Target, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckInDialog } from "@/components/check-in-dialog"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { useTrainingData } from "@/hooks/use-training-data"

export default function BadmintonTrainingApp() {
  const {
    trainingData,
    userSettings,
    appState,
    addTrainingRecord,
    updateAppState,
    getTodayDateString,
    isTodayCheckedIn,
    calculateCurrentStreak,
    getMonthlyProgress,
  } = useTrainingData()

  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 当前状态
  const isCheckedIn = isTodayCheckedIn()
  const currentStreak = calculateCurrentStreak()
  const monthlyProgress = getMonthlyProgress()
  const monthlyGoal = userSettings.monthlyGoal

  // 计算本月总时长
  const calculateMonthlyDuration = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let totalDuration = 0
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const training = trainingData[dateKey]
      if (training) {
        totalDuration += training.duration
      }
    }

    return Math.round((totalDuration / 60) * 10) / 10 // 转换为小时并保留一位小数
  }

  const monthlyDuration = calculateMonthlyDuration()

  // 今日统计
  const todayRecord = trainingData[getTodayDateString()]
  const todayStats = {
    duration: todayRecord?.duration || 0,
    intensity: todayRecord?.intensity || "未训练",
    calories: todayRecord?.calories || 0,
  }

  // 组件加载完成
  useEffect(() => {
    setIsLoading(false)
  }, [])

  // 检查里程碑达成
  useEffect(() => {
    const currentPercentage = (monthlyProgress / monthlyGoal) * 100
    const milestones = [25, 50, 75, 100]

    // 检查是否是新的月份，如果是则重置里程碑
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastCheckDate = new Date(appState.lastCheckInDate || new Date())

    if (lastCheckDate.getMonth() !== currentMonth || lastCheckDate.getFullYear() !== currentYear) {
      updateAppState({ lastMilestone: 0 })
      return
    }

    // 找到当前应该达到的最高里程碑
    let highestAchievedMilestone = 0
    for (const milestone of milestones) {
      if (currentPercentage >= milestone) {
        highestAchievedMilestone = milestone
      }
    }

    // 只有当达到了新的最高里程碑且之前未达到时才触发庆祝
    if (highestAchievedMilestone > appState.lastMilestone && highestAchievedMilestone > 0 && !celebratingMilestone) {
      const actualProgress = monthlyProgress
      const requiredProgress = Math.ceil(monthlyGoal * (highestAchievedMilestone / 100))

      if (actualProgress >= requiredProgress) {
        setCelebratingMilestone(highestAchievedMilestone)
        updateAppState({ lastMilestone: highestAchievedMilestone })

        // 3秒后停止庆祝动画
        setTimeout(() => {
          setCelebratingMilestone(null)
        }, 3000)
      }
    }
  }, [
    monthlyProgress,
    monthlyGoal,
    appState.lastMilestone,
    appState.lastCheckInDate,
    updateAppState,
    celebratingMilestone,
  ])

  const getMilestoneMessage = (milestone: number) => {
    switch (milestone) {
      case 25:
        return "🎉 太棒了！完成了四分之一的目标！"
      case 50:
        return "🔥 amazing！已经完成一半啦！"
      case 75:
        return "💪 incredible！只差最后一步了！"
      case 100:
        return "🏆 恭喜！本月目标完美达成！"
      default:
        return "🎊 里程碑达成！"
    }
  }

  // 处理打卡完成
  const handleCheckInComplete = (duration: number, intensity: "轻松" | "中等" | "高强度") => {
    const todayDateString = getTodayDateString()
    addTrainingRecord(todayDateString, duration, intensity)
    setShowCheckInDialog(false)
  }

  // 获取最近的训练记录
  const getRecentRecords = () => {
    const sortedRecords = Object.values(trainingData)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)

    return sortedRecords.map((record) => ({
      title: `${record.intensity}训练`,
      date: new Date(record.date).toLocaleDateString("zh-CN"),
      duration: `${record.duration}分钟`,
    }))
  }

  const recentRecords = getRecentRecords()

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* 庆祝动画覆盖层 */}
        {celebratingMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 mx-4 text-center shadow-2xl animate-in zoom-in duration-500">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <div className="text-xl font-bold text-gray-900 mb-2">里程碑达成！</div>
              <div className="text-lg text-blue-600 mb-4">{getMilestoneMessage(celebratingMilestone)}</div>
              <div className="text-4xl font-bold text-green-600 mb-2">{celebratingMilestone}%</div>
              <div className="text-sm text-gray-500">继续保持，你做得很棒！</div>

              {/* 彩带动画 */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
                <div className="confetti-piece confetti-1"></div>
                <div className="confetti-piece confetti-2"></div>
                <div className="confetti-piece confetti-3"></div>
                <div className="confetti-piece confetti-4"></div>
                <div className="confetti-piece confetti-5"></div>
                <div className="confetti-piece confetti-6"></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">羽毛球训练记录</h1>
          <p className="text-gray-600">坚持训练，成就更好的自己</p>
          {/* 数据状态指示器 */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">数据已同步</span>
          </div>
        </div>

        {/* Today's Check-in Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              今日训练
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCheckedIn ? (
              <Button
                onClick={() => setShowCheckInDialog(true)}
                className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Play className="mr-2 h-6 w-6" />
                开始训练打卡
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
                  ✅ 今日已打卡
                </Badge>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{todayStats.duration}</div>
                    <div className="text-xs text-gray-500">分钟</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-orange-600">{todayStats.intensity}</div>
                    <div className="text-xs text-gray-500">强度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{todayStats.calories}</div>
                    <div className="text-xs text-gray-500">卡路里</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 本月进度 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">本月进度</CardTitle>
            <CardDescription>
              已训练 {monthlyProgress} 天 / 目标 {monthlyGoal} 天 • 连续 {currentStreak} 天
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">完成进度</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((monthlyProgress / monthlyGoal) * 100)}%
                </span>
              </div>

              {/* 进度条容器 */}
              <div className="relative">
                <Progress value={(monthlyProgress / monthlyGoal) * 100} className="h-3 bg-gray-200" />

                {/* 里程碑标记 */}
                <div className="absolute top-0 left-0 w-full h-3 pointer-events-none">
                  {/* 25% 标记 */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2" style={{ left: "25%" }}>
                    <div
                      className={`w-2 h-2 rounded-full border-2 border-white transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 25 ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}
                    ></div>
                  </div>

                  {/* 50% 标记 */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2" style={{ left: "50%" }}>
                    <div
                      className={`w-2 h-2 rounded-full border-2 border-white transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 50 ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}
                    ></div>
                  </div>

                  {/* 75% 标记 */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2" style={{ left: "75%" }}>
                    <div
                      className={`w-2 h-2 rounded-full border-2 border-white transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 75 ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 里程碑标签 */}
              <div className="relative mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0天</span>
                  <span className="absolute left-1/4 transform -translate-x-1/2 text-center">
                    <div
                      className={`transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 25 ? "text-blue-600 font-medium animate-bounce" : ""
                      }`}
                    >
                      25%
                    </div>
                    <div className="text-gray-400 text-xs">{Math.ceil(monthlyGoal * 0.25)}天</div>
                  </span>
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    <div
                      className={`transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 50 ? "text-blue-600 font-medium animate-bounce" : ""
                      }`}
                    >
                      50%
                    </div>
                    <div className="text-gray-400 text-xs">{Math.ceil(monthlyGoal * 0.5)}天</div>
                  </span>
                  <span className="absolute left-3/4 transform -translate-x-1/2 text-center">
                    <div
                      className={`transition-all duration-300 ${
                        (monthlyProgress / monthlyGoal) * 100 >= 75 ? "text-blue-600 font-medium animate-bounce" : ""
                      }`}
                    >
                      75%
                    </div>
                    <div className="text-gray-400 text-xs">{Math.ceil(monthlyGoal * 0.75)}天</div>
                  </span>
                  <span>{monthlyGoal}天</span>
                </div>
              </div>
            </div>

            {/* 统计数据网格 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{monthlyProgress}</div>
                <div className="text-sm text-gray-500">训练天数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{monthlyDuration}h</div>
                <div className="text-sm text-gray-500">本月时长</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
                <div className="text-sm text-gray-500">连续天数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近记录 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">最近记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecords.length > 0 ? (
                recentRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{record.title}</div>
                      <div className="text-sm text-gray-500">{record.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{record.duration}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>还没有训练记录</p>
                  <p className="text-sm">开始你的第一次训练吧！</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Dialog */}
        <CheckInDialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog} onCheckIn={handleCheckInComplete} />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* 添加庆祝动画的CSS样式 */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
          animation: confetti-fall 3s linear infinite;
        }

        .confetti-1 {
          left: 10%;
          animation-delay: 0s;
          background-color: #ff6b6b;
        }

        .confetti-2 {
          left: 20%;
          animation-delay: 0.5s;
          background-color: #4ecdc4;
        }

        .confetti-3 {
          left: 30%;
          animation-delay: 1s;
          background-color: #45b7d1;
        }

        .confetti-4 {
          left: 70%;
          animation-delay: 0.3s;
          background-color: #96ceb4;
        }

        .confetti-5 {
          left: 80%;
          animation-delay: 0.8s;
          background-color: #feca57;
        }

        .confetti-6 {
          left: 90%;
          animation-delay: 1.2s;
          background-color: #ff9ff3;
        }
      `}</style>
    </div>
  )
}
