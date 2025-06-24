"use client"

import { useState } from "react"
import {
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Zap,
  Lightbulb,
  Target,
  AlertTriangle,
  Play,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const WEEKDAYS_FULL = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

// 训练记录类型定义
interface TrainingRecord {
  duration: number
  intensity: "轻松" | "中等" | "高强度"
  calories: number
  date: string
}

interface TrainingStatsProps {
  trainingData: Record<string, TrainingRecord>
}

interface MonthlyStats {
  totalDays: number
  totalDuration: number
  totalCalories: number
  lightDays: number
  moderateDays: number
  intenseDays: number
  lightDuration: number
  moderateDuration: number
  intenseDuration: number
}

interface TrainingAdvice {
  type: "success" | "warning" | "info"
  title: string
  description: string
  suggestions: string[]
}

interface WeeklyPlan {
  date: string
  dayName: string
  isRest: boolean
  training?: {
    type: string
    intensity: "轻松" | "中等" | "高强度"
    duration: number
    description: string
    focus: string[]
  }
}

export function TrainingStats({ trainingData }: TrainingStatsProps) {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([])
  const [showPlan, setShowPlan] = useState(false)

  // 计算当前连续打卡天数
  const calculateCurrentStreak = () => {
    const sortedDates = Object.keys(trainingData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    if (sortedDates.length === 0) return 0

    let streak = 0
    const today = new Date()
    const currentDate = new Date(today)

    // 如果今天没打卡，从昨天开始计算
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    if (!trainingData[todayString]) {
      currentDate.setDate(currentDate.getDate() - 1)
    }

    while (true) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
      if (trainingData[dateString]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  // 计算实际成就数据
  const calculateAchievements = () => {
    const monthlyStats = calculateMonthlyStats()
    const totalRecords = Object.keys(trainingData).length
    const totalHours =
      Math.round((Object.values(trainingData).reduce((sum, record) => sum + record.duration, 0) / 60) * 10) / 10
    const highIntensityCount = Object.values(trainingData).filter((record) => record.intensity === "高强度").length

    // 计算最长连续打卡记录
    const calculateMaxStreak = () => {
      const sortedDates = Object.keys(trainingData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      if (sortedDates.length === 0) return 0

      let maxStreak = 1
      let currentStreak = 1

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1])
        const currentDate = new Date(sortedDates[i])
        const diffTime = currentDate.getTime() - prevDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }

      return maxStreak
    }

    const currentStreak = calculateCurrentStreak()
    const maxStreak = calculateMaxStreak()

    return [
      {
        title: "连续打卡7天",
        icon: "🔥",
        unlocked: currentStreak >= 7, // 修复：使用 >= 而不是 ===
        description: `当前连续 ${currentStreak} 天`,
        progress: Math.min(currentStreak, 7),
        target: 7,
      },
      {
        title: "单月训练20小时",
        icon: "⏰",
        unlocked: monthlyStats.totalDuration >= 1200, // 20小时 = 1200分钟
        description: `本月已训练 ${Math.round(monthlyStats.totalDuration / 60)} 小时`,
        progress: Math.min(monthlyStats.totalDuration, 1200),
        target: 1200,
      },
      {
        title: "高强度训练10次",
        icon: "💪",
        unlocked: highIntensityCount >= 10,
        description: `已完成 ${highIntensityCount} 次高强度训练`,
        progress: Math.min(highIntensityCount, 10),
        target: 10,
      },
      {
        title: "完美一周",
        icon: "⭐",
        unlocked: maxStreak >= 7, // 修复：使用 >= 而不是 ===
        description: maxStreak >= 7 ? `最长连续 ${maxStreak} 天！` : `最长连续 ${maxStreak} 天，还需努力`,
        progress: Math.min(maxStreak, 7),
        target: 7,
      },
      {
        title: "训练达人",
        icon: "🏆",
        unlocked: totalRecords >= 30,
        description: `累计训练 ${totalRecords} 天`,
        progress: Math.min(totalRecords, 30),
        target: 30,
      },
      {
        title: "时间管理大师",
        icon: "⌚",
        unlocked: totalHours >= 50,
        description: `累计训练 ${totalHours} 小时`,
        progress: Math.min(totalHours * 60, 3000), // 转换为分钟进行计算
        target: 3000, // 50小时 = 3000分钟
      },
    ]
  }

  const achievements = calculateAchievements()

  // 计算本月统计数据
  function calculateMonthlyStats(): MonthlyStats {
    const stats: MonthlyStats = {
      totalDays: 0,
      totalDuration: 0,
      totalCalories: 0,
      lightDays: 0,
      moderateDays: 0,
      intenseDays: 0,
      lightDuration: 0,
      moderateDuration: 0,
      intenseDuration: 0,
    }

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // 遍历当前月份的所有日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const training = trainingData[dateKey]

      if (training) {
        stats.totalDays++
        stats.totalDuration += training.duration
        stats.totalCalories += training.calories

        switch (training.intensity) {
          case "轻松":
            stats.lightDays++
            stats.lightDuration += training.duration
            break
          case "中等":
            stats.moderateDays++
            stats.moderateDuration += training.duration
            break
          case "高强度":
            stats.intenseDays++
            stats.intenseDuration += training.duration
            break
        }
      }
    }

    return stats
  }

  // 生成训练建议
  const generateTrainingAdvice = (stats: MonthlyStats): TrainingAdvice[] => {
    const advice: TrainingAdvice[] = []

    if (stats.totalDays === 0) {
      advice.push({
        type: "info",
        title: "开始你的训练之旅",
        description: "本月还没有训练记录，建议制定一个合理的训练计划。",
        suggestions: ["每周安排3-4次训练", "从轻松强度开始，逐步适应", "每次训练45-60分钟为宜", "保持规律的训练节奏"],
      })
      return advice
    }

    // 计算各强度比例
    const lightPercentage = (stats.lightDays / stats.totalDays) * 100
    const moderatePercentage = (stats.moderateDays / stats.totalDays) * 100
    const intensePercentage = (stats.intenseDays / stats.totalDays) * 100

    // 训练频率分析
    if (stats.totalDays < 8) {
      advice.push({
        type: "warning",
        title: "训练频率偏低",
        description: "本月训练天数较少，建议增加训练频率以获得更好效果。",
        suggestions: [
          "目标每周训练3-4次",
          "可以增加一些轻松的恢复性训练",
          "保持训练的连续性很重要",
          "逐步增加训练量，避免突然加大强度",
        ],
      })
    } else if (stats.totalDays > 20) {
      advice.push({
        type: "warning",
        title: "注意训练恢复",
        description: "训练频率很高，要注意合理安排休息和恢复。",
        suggestions: [
          "确保每周至少有1-2天完全休息",
          "增加轻松训练的比例",
          "注意身体信号，避免过度训练",
          "保证充足的睡眠和营养",
        ],
      })
    }

    // 强度分布分析
    if (lightPercentage < 50) {
      advice.push({
        type: "warning",
        title: "轻松训练不足",
        description: "轻松训练比例偏低，可能影响恢复和基础耐力建设。",
        suggestions: [
          "增加轻松强度的训练比例至60-70%",
          "轻松训练有助于恢复和基础能力提升",
          "可以进行技术练习和基础体能训练",
          "轻松训练同样重要，不要忽视",
        ],
      })
    }

    if (intensePercentage > 30) {
      advice.push({
        type: "warning",
        title: "高强度训练过多",
        description: "高强度训练比例过高，可能导致疲劳累积和受伤风险。",
        suggestions: [
          "减少高强度训练至总量的15-20%",
          "高强度训练后要安排充分恢复",
          "增加轻松和中等强度训练的比例",
          "质量比数量更重要",
        ],
      })
    } else if (intensePercentage < 5 && stats.totalDays > 10) {
      advice.push({
        type: "info",
        title: "可以适当增加挑战",
        description: "高强度训练比例较低，可以适当增加一些挑战性训练。",
        suggestions: [
          "每周安排1-2次高强度训练",
          "高强度训练有助于提升竞技水平",
          "确保在身体状态良好时进行",
          "循序渐进，不要急于求成",
        ],
      })
    }

    // 训练时长分析
    const avgDuration = stats.totalDuration / stats.totalDays
    if (avgDuration < 45) {
      advice.push({
        type: "info",
        title: "可以适当延长训练时间",
        description: "平均训练时长较短，可以考虑适当延长以获得更好效果。",
        suggestions: [
          "建议每次训练45-90分钟",
          "包含热身、主要训练和放松环节",
          "根据训练强度调整时长",
          "质量比时长更重要",
        ],
      })
    } else if (avgDuration > 120) {
      advice.push({
        type: "warning",
        title: "训练时长较长",
        description: "平均训练时长较长，注意避免过度疲劳。",
        suggestions: [
          "单次训练不宜超过2小时",
          "长时间训练要注意补充水分",
          "可以分解为多个短时间训练",
          "关注训练质量而非时长",
        ],
      })
    }

    // 如果训练分布合理，给予鼓励
    if (
      lightPercentage >= 50 &&
      lightPercentage <= 75 &&
      moderatePercentage >= 15 &&
      moderatePercentage <= 35 &&
      intensePercentage >= 10 &&
      intensePercentage <= 25 &&
      stats.totalDays >= 8 &&
      stats.totalDays <= 20
    ) {
      advice.push({
        type: "success",
        title: "训练安排很合理！",
        description: "你的训练强度分布和频率都很科学，继续保持！",
        suggestions: [
          "当前的训练安排很棒，继续坚持",
          "可以根据身体状态微调训练强度",
          "保持训练的多样性和趣味性",
          "定期评估和调整训练计划",
        ],
      })
    }

    return advice
  }

  // 生成下周训练计划
  const generateWeeklyPlan = (stats: MonthlyStats, advice: TrainingAdvice[]): WeeklyPlan[] => {
    const plan: WeeklyPlan[] = []
    const today = new Date()
    const nextMonday = new Date(today)

    // 找到下周一
    const daysUntilMonday = (8 - today.getDay()) % 7
    nextMonday.setDate(today.getDate() + daysUntilMonday)

    // 根据统计数据和建议调整训练安排
    const needMoreLight = stats.totalDays > 0 && stats.lightDays / stats.totalDays < 0.5
    const needMoreIntense = stats.totalDays > 0 && stats.intenseDays / stats.totalDays < 0.1
    const needLessIntense = stats.totalDays > 0 && stats.intenseDays / stats.totalDays > 0.3
    const needMoreFrequency = stats.totalDays < 8
    const needLessFrequency = stats.totalDays > 20

    // 基础训练安排模板
    const baseSchedule = [
      { day: 0, isRest: true }, // 周日休息
      { day: 1, isRest: false, intensity: "轻松" as const, type: "技术训练" },
      { day: 2, isRest: false, intensity: "中等" as const, type: "体能训练" },
      { day: 3, isRest: true }, // 周三休息
      { day: 4, isRest: false, intensity: "高强度" as const, type: "对抗训练" },
      { day: 5, isRest: false, intensity: "轻松" as const, type: "恢复训练" },
      { day: 6, isRest: false, intensity: "中等" as const, type: "综合训练" },
    ]

    // 根据建议调整计划
    const adjustedSchedule = [...baseSchedule]

    if (needMoreFrequency) {
      // 增加训练频率，将周三休息改为轻松训练
      adjustedSchedule[3] = { day: 3, isRest: false, intensity: "轻松", type: "基础训练" }
    }

    if (needLessFrequency) {
      // 减少训练频率，增加休息日
      adjustedSchedule[5] = { day: 5, isRest: true }
    }

    if (needMoreLight) {
      // 增加轻松训练，将中等强度改为轻松
      adjustedSchedule[2] = { day: 2, isRest: false, intensity: "轻松", type: "技术训练" }
      adjustedSchedule[6] = { day: 6, isRest: false, intensity: "轻松", type: "恢复训练" }
    }

    if (needLessIntense) {
      // 减少高强度训练
      adjustedSchedule[4] = { day: 4, isRest: false, intensity: "中等", type: "技术训练" }
    }

    if (needMoreIntense && !needLessIntense) {
      // 增加高强度训练
      adjustedSchedule[6] = { day: 6, isRest: false, intensity: "高强度", type: "对抗训练" }
    }

    // 生成具体的训练计划
    for (let i = 0; i < 7; i++) {
      const planDate = new Date(nextMonday)
      planDate.setDate(nextMonday.getDate() + i)

      const dateString = `${planDate.getFullYear()}-${String(planDate.getMonth() + 1).padStart(2, "0")}-${String(planDate.getDate()).padStart(2, "0")}`
      const schedule = adjustedSchedule[i]

      if (schedule.isRest) {
        plan.push({
          date: dateString,
          dayName: WEEKDAYS_FULL[i],
          isRest: true,
        })
      } else {
        const trainingDetails = getTrainingDetails(schedule.intensity!, schedule.type!)
        plan.push({
          date: dateString,
          dayName: WEEKDAYS_FULL[i],
          isRest: false,
          training: {
            type: schedule.type!,
            intensity: schedule.intensity!,
            duration: trainingDetails.duration,
            description: trainingDetails.description,
            focus: trainingDetails.focus,
          },
        })
      }
    }

    return plan
  }

  // 获取训练详情
  const getTrainingDetails = (intensity: "轻松" | "中等" | "高强度", type: string) => {
    const details = {
      duration: 60,
      description: "",
      focus: [] as string[],
    }

    switch (intensity) {
      case "轻松":
        details.duration = 45
        break
      case "中等":
        details.duration = 60
        break
      case "高强度":
        details.duration = 75
        break
    }

    switch (type) {
      case "技术训练":
        details.description = "专注于基本技术动作的练习和改进"
        details.focus = ["发球练习", "正反手挥拍", "步法训练", "网前技术"]
        break
      case "体能训练":
        details.description = "提升身体素质和运动能力"
        details.focus = ["有氧耐力", "爆发力训练", "敏捷性练习", "核心力量"]
        break
      case "对抗训练":
        details.description = "实战对抗，提升比赛能力"
        details.focus = ["单打对抗", "双打配合", "战术演练", "比赛模拟"]
        break
      case "恢复训练":
        details.description = "低强度训练，促进身体恢复"
        details.focus = ["拉伸放松", "技术巩固", "轻松对练", "身体调整"]
        break
      case "综合训练":
        details.description = "技术与体能相结合的综合性训练"
        details.focus = ["技战术结合", "多球练习", "体能测试", "全面提升"]
        break
      case "基础训练":
        details.description = "基础动作和体能的入门训练"
        details.focus = ["基本动作", "体能基础", "规则学习", "兴趣培养"]
        break
    }

    return details
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "高强度":
        return "bg-red-500"
      case "中等":
        return "bg-yellow-500"
      case "轻松":
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const monthlyStats = calculateMonthlyStats()
  const trainingAdvice = generateTrainingAdvice(monthlyStats)

  const handleGeneratePlan = () => {
    const plan = generateWeeklyPlan(monthlyStats, trainingAdvice)
    setWeeklyPlan(plan)
    setShowPlan(true)
  }

  return (
    <div className="space-y-6">
      {/* 统计数据卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            本月统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 总体统计 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalDays}</div>
              <div className="text-sm text-gray-600">训练天数</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((monthlyStats.totalDuration / 60) * 10) / 10}h
              </div>
              <div className="text-sm text-gray-600">总时长</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{monthlyStats.totalCalories}</div>
              <div className="text-sm text-gray-600">总卡路里</div>
            </div>
          </div>

          {/* 强度分布统计 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">强度分布</span>
            </div>

            {/* 轻松训练 */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium text-green-800">轻松训练</div>
                  <div className="text-sm text-green-600">
                    {Math.round((monthlyStats.lightDuration / 60) * 10) / 10}小时
                    {monthlyStats.totalDays > 0 && (
                      <span className="ml-2">
                        ({Math.round((monthlyStats.lightDays / monthlyStats.totalDays) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-700">{monthlyStats.lightDays}</div>
                <div className="text-xs text-green-600">天</div>
              </div>
            </div>

            {/* 中等强度 */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <div>
                  <div className="font-medium text-yellow-800">中等强度</div>
                  <div className="text-sm text-yellow-600">
                    {Math.round((monthlyStats.moderateDuration / 60) * 10) / 10}小时
                    {monthlyStats.totalDays > 0 && (
                      <span className="ml-2">
                        ({Math.round((monthlyStats.moderateDays / monthlyStats.totalDays) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-700">{monthlyStats.moderateDays}</div>
                <div className="text-xs text-yellow-600">天</div>
              </div>
            </div>

            {/* 高强度训练 */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <div>
                  <div className="font-medium text-red-800">高强度训练</div>
                  <div className="text-sm text-red-600">
                    {Math.round((monthlyStats.intenseDuration / 60) * 10) / 10}小时
                    {monthlyStats.totalDays > 0 && (
                      <span className="ml-2">
                        ({Math.round((monthlyStats.intenseDays / monthlyStats.totalDays) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-700">{monthlyStats.intenseDays}</div>
                <div className="text-xs text-red-600">天</div>
              </div>
            </div>
          </div>

          {/* 平均数据 */}
          {monthlyStats.totalDays > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">平均数据</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">
                    {Math.round(monthlyStats.totalDuration / monthlyStats.totalDays)}分钟
                  </div>
                  <div className="text-xs text-gray-500">平均时长</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">
                    {Math.round(monthlyStats.totalCalories / monthlyStats.totalDays)}卡
                  </div>
                  <div className="text-xs text-gray-500">平均消耗</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 成就徽章卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-yellow-600" />
            成就徽章
            <Badge variant="secondary" className="ml-auto">
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                  achievement.unlocked
                    ? "border-yellow-200 bg-yellow-50 shadow-md transform hover:scale-105"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className={`text-2xl mb-2 ${achievement.unlocked ? "animate-bounce" : "grayscale opacity-50"}`}>
                  {achievement.icon}
                </div>
                <div
                  className={`text-xs font-medium mb-2 ${achievement.unlocked ? "text-yellow-800" : "text-gray-500"}`}
                >
                  {achievement.title}
                </div>
                <div className={`text-xs mb-2 ${achievement.unlocked ? "text-yellow-600" : "text-gray-400"}`}>
                  {achievement.description}
                </div>

                {/* 进度条 */}
                {!achievement.unlocked && (
                  <div className="mt-2">
                    <Progress value={(achievement.progress / achievement.target) * 100} className="h-1" />
                    <div className="text-xs text-gray-400 mt-1">
                      {achievement.progress}/{achievement.target}
                    </div>
                  </div>
                )}

                {achievement.unlocked && (
                  <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                    ✨ 已解锁
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* 成就统计 */}
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="text-center">
              <div className="text-sm font-medium text-yellow-800 mb-1">成就完成度</div>
              <div className="flex items-center justify-center gap-2">
                <Progress
                  value={(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-sm font-bold text-yellow-700">
                  {Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 其他功能的Tabs */}
      <Tabs defaultValue="advice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advice">训练建议</TabsTrigger>
          <TabsTrigger value="plan">训练计划</TabsTrigger>
          <TabsTrigger value="trends">训练趋势</TabsTrigger>
        </TabsList>

        {/* 训练建议标签页 */}
        <TabsContent value="advice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                智能训练建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingAdvice.map((advice, index) => (
                  <Alert
                    key={index}
                    className={`border-l-4 ${
                      advice.type === "success"
                        ? "border-l-green-500 bg-green-50"
                        : advice.type === "warning"
                          ? "border-l-yellow-500 bg-yellow-50"
                          : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {advice.type === "success" && <Target className="h-5 w-5 text-green-600 mt-0.5" />}
                      {advice.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {advice.type === "info" && <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <AlertDescription>
                          <div
                            className={`font-semibold mb-2 ${
                              advice.type === "success"
                                ? "text-green-800"
                                : advice.type === "warning"
                                  ? "text-yellow-800"
                                  : "text-blue-800"
                            }`}
                          >
                            {advice.title}
                          </div>
                          <div className="text-gray-700 mb-3">{advice.description}</div>
                          <ul className="space-y-1">
                            {advice.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 训练计划标签页 */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  下周训练计划
                </CardTitle>
                <Button onClick={handleGeneratePlan} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  生成计划
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!showPlan ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">点击"生成计划"按钮，根据你的训练数据智能制定下周训练安排</p>
                  <Button onClick={handleGeneratePlan} className="flex items-center gap-2 mx-auto">
                    <Play className="h-4 w-4" />
                    开始制定计划
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyPlan.map((day, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        day.isRest
                          ? "bg-gray-50 border-gray-200"
                          : day.training?.intensity === "高强度"
                            ? "bg-red-50 border-red-200"
                            : day.training?.intensity === "中等"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{day.dayName}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(day.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                        {day.isRest ? (
                          <Badge variant="outline" className="bg-gray-100">
                            休息日
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className={`${getIntensityColor(day.training!.intensity)} text-white`}
                          >
                            {day.training!.intensity}
                          </Badge>
                        )}
                      </div>

                      {!day.isRest && day.training && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">{day.training.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="text-sm">{day.training.duration}分钟</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{day.training.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {day.training.focus.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">计划说明</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 此计划根据你的历史训练数据和建议自动生成</li>
                      <li>• 可以根据实际情况灵活调整训练强度和时间</li>
                      <li>• 建议在训练前进行充分热身，训练后做好拉伸放松</li>
                      <li>• 如有身体不适，请及时调整或休息</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 训练趋势标签页 */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                训练趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">周平均训练时长</span>
                  <span className="font-semibold">
                    {monthlyStats.totalDays > 0
                      ? `${Math.round(((monthlyStats.totalDuration / monthlyStats.totalDays) * 7) / 7)}分钟`
                      : "暂无数据"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最长连续打卡</span>
                  <span className="font-semibold">
                    {(() => {
                      const sortedDates = Object.keys(trainingData).sort(
                        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
                      )
                      if (sortedDates.length === 0) return "0天"

                      let maxStreak = 1
                      let currentStreak = 1

                      for (let i = 1; i < sortedDates.length; i++) {
                        const prevDate = new Date(sortedDates[i - 1])
                        const currentDate = new Date(sortedDates[i])
                        const diffTime = currentDate.getTime() - prevDate.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        if (diffDays === 1) {
                          currentStreak++
                          maxStreak = Math.max(maxStreak, currentStreak)
                        } else {
                          currentStreak = 1
                        }
                      }

                      return `${maxStreak}天`
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最喜欢的训练强度</span>
                  <Badge
                    variant="secondary"
                    className={`${
                      monthlyStats.lightDays >= monthlyStats.moderateDays &&
                      monthlyStats.lightDays >= monthlyStats.intenseDays
                        ? "bg-green-100 text-green-800"
                        : monthlyStats.moderateDays >= monthlyStats.intenseDays
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {monthlyStats.lightDays >= monthlyStats.moderateDays &&
                    monthlyStats.lightDays >= monthlyStats.intenseDays
                      ? "轻松"
                      : monthlyStats.moderateDays >= monthlyStats.intenseDays
                        ? "中等"
                        : "高强度"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">累计消耗卡路里</span>
                  <span className="font-semibold">
                    {Object.values(trainingData).reduce((sum, record) => sum + record.calories, 0)}卡
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均训练时长</span>
                  <span className="font-semibold text-green-600">
                    {monthlyStats.totalDays > 0
                      ? `${Math.round(monthlyStats.totalDuration / monthlyStats.totalDays)}分钟`
                      : "暂无数据"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">本月训练频率</span>
                  <span className="font-semibold text-blue-600">
                    {monthlyStats.totalDays > 0
                      ? `${Math.round((monthlyStats.totalDays / new Date().getDate()) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
