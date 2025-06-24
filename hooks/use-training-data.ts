"use client"

import { useLocalStorage } from "./use-local-storage"

// 训练记录类型定义
export interface TrainingRecord {
  duration: number
  intensity: "轻松" | "中等" | "高强度"
  calories: number
  date: string
  timestamp: number // 添加时间戳用于排序和去重
}

// 用户设置类型
export interface UserSettings {
  monthlyGoal: number
  userName: string
  totalTrainingDays: number
  totalTrainingHours: number
  joinDate: string
}

// 应用状态类型
export interface AppState {
  lastMilestone: number
  currentStreak: number
  lastCheckInDate: string
}

// 默认训练数据
const defaultTrainingData: Record<string, TrainingRecord> = {
  "2025-06-01": {
    duration: 60,
    intensity: "中等",
    calories: 300,
    date: "2025-06-01",
    timestamp: Date.now() - 22 * 24 * 60 * 60 * 1000,
  },
  "2025-06-09": {
    duration: 90,
    intensity: "高强度",
    calories: 450,
    date: "2025-06-09",
    timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  "2025-06-10": {
    duration: 45,
    intensity: "轻松",
    calories: 225,
    date: "2025-06-10",
    timestamp: Date.now() - 18 * 24 * 60 * 60 * 1000,
  },
  "2025-06-15": {
    duration: 75,
    intensity: "高强度",
    calories: 375,
    date: "2025-06-15",
    timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  "2025-06-16": {
    duration: 60,
    intensity: "中等",
    calories: 300,
    date: "2025-06-16",
    timestamp: Date.now() - 13 * 24 * 60 * 60 * 1000,
  },
  "2025-06-17": {
    duration: 90,
    intensity: "高强度",
    calories: 450,
    date: "2025-06-17",
    timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000,
  },
  "2025-06-18": {
    duration: 45,
    intensity: "轻松",
    calories: 225,
    date: "2025-06-18",
    timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
  "2025-06-19": {
    duration: 80,
    intensity: "中等",
    calories: 400,
    date: "2025-06-19",
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  "2025-06-20": {
    duration: 95,
    intensity: "高强度",
    calories: 475,
    date: "22025-06-20",
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  "2025-06-21": {
    duration: 60,
    intensity: "中等",
    calories: 300,
    date: "2025-06-21",
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  "2025-06-22": { duration: 90, intensity: "高强度", calories: 450, date: "2025-06-22", timestamp: Date.now() },
}

// 默认用户设置
const defaultUserSettings: UserSettings = {
  monthlyGoal: 20,
  userName: "羽毛球爱好者",
  totalTrainingDays: 45,
  totalTrainingHours: 156,
  joinDate: new Date().toISOString().split("T")[0],
}

// 默认应用状态
const defaultAppState: AppState = {
  lastMilestone: 0,
  currentStreak: 7,
  lastCheckInDate: "",
}

// 训练数据管理hook
export function useTrainingData() {
  const [trainingData, setTrainingData] = useLocalStorage<Record<string, TrainingRecord>>(
    "badminton-training-data",
    defaultTrainingData,
  )

  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>("badminton-user-settings", defaultUserSettings)

  const [appState, setAppState] = useLocalStorage<AppState>("badminton-app-state", defaultAppState)

  // 添加训练记录
  const addTrainingRecord = (date: string, duration: number, intensity: "轻松" | "中等" | "高强度") => {
    const calories = Math.round(duration * (intensity === "高强度" ? 6 : intensity === "中等" ? 5 : 4))

    const newRecord: TrainingRecord = {
      duration,
      intensity,
      calories,
      date,
      timestamp: Date.now(),
    }

    setTrainingData((prev) => ({
      ...prev,
      [date]: newRecord,
    }))

    // 更新用户统计
    setUserSettings((prev) => ({
      ...prev,
      totalTrainingDays: Object.keys({ ...trainingData, [date]: newRecord }).length,
      totalTrainingHours:
        Math.round(
          (Object.values({ ...trainingData, [date]: newRecord }).reduce((sum, record) => sum + record.duration, 0) /
            60) *
            10,
        ) / 10,
    }))

    // 更新最后打卡日期
    setAppState((prev) => ({
      ...prev,
      lastCheckInDate: date,
    }))

    return newRecord
  }

  // 删除训练记录
  const deleteTrainingRecord = (date: string) => {
    setTrainingData((prev) => {
      const newData = { ...prev }
      delete newData[date]
      return newData
    })

    // 更新用户统计
    const updatedData = { ...trainingData }
    delete updatedData[date]

    setUserSettings((prev) => ({
      ...prev,
      totalTrainingDays: Object.keys(updatedData).length,
      totalTrainingHours:
        Math.round((Object.values(updatedData).reduce((sum, record) => sum + record.duration, 0) / 60) * 10) / 10,
    }))
  }

  // 更新用户设置
  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setUserSettings((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  // 更新应用状态
  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  // 获取今天的日期字符串
  const getTodayDateString = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  }

  // 检查今天是否已打卡
  const isTodayCheckedIn = () => {
    const today = getTodayDateString()
    return !!trainingData[today]
  }

  // 计算当前连续打卡天数
  const calculateCurrentStreak = () => {
    const sortedDates = Object.keys(trainingData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (sortedDates.length === 0) return 0

    let streak = 0
    const today = new Date()
    const currentDate = new Date(today)

    // 如果今天没打卡，从昨天开始计算
    if (!isTodayCheckedIn()) {
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

  // 计算本月训练天数
  const getMonthlyProgress = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    let count = 0
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      if (trainingData[dateKey]) {
        count++
      }
    }

    return count
  }

  // 导出数据
  const exportData = () => {
    const exportData = {
      trainingData,
      userSettings,
      appState,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `badminton-training-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导入数据
  const importData = (file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)

          if (importedData.trainingData) {
            setTrainingData(importedData.trainingData)
          }
          if (importedData.userSettings) {
            setUserSettings(importedData.userSettings)
          }
          if (importedData.appState) {
            setAppState(importedData.appState)
          }

          resolve(true)
        } catch (error) {
          console.error("导入数据失败:", error)
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("文件读取失败"))
      }

      reader.readAsText(file)
    })
  }

  // 清空所有数据
  const clearAllData = () => {
    setTrainingData({})
    setUserSettings(defaultUserSettings)
    setAppState(defaultAppState)
  }

  return {
    // 数据
    trainingData,
    userSettings,
    appState,

    // 操作方法
    addTrainingRecord,
    deleteTrainingRecord,
    updateUserSettings,
    updateAppState,

    // 计算方法
    getTodayDateString,
    isTodayCheckedIn,
    calculateCurrentStreak,
    getMonthlyProgress,

    // 数据管理
    exportData,
    importData,
    clearAllData,
  }
}
