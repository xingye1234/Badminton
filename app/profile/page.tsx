"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useTrainingData } from "@/hooks/use-training-data"
import { Download, Upload, Trash2, Settings, User, Database, Target, Calendar, Trophy, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { userSettings, updateUserSettings, exportData, importData, clearAllData, trainingData, getMonthlyProgress } =
    useTrainingData()

  const [isEditing, setIsEditing] = useState(false)
  const [tempSettings, setTempSettings] = useState(userSettings)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const monthlyProgress = getMonthlyProgress()

  // 显示消息
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 保存设置
  const handleSaveSettings = () => {
    updateUserSettings(tempSettings)
    setIsEditing(false)
    showMessage("success", "设置已保存")
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setTempSettings(userSettings)
    setIsEditing(false)
  }

  // 导出数据
  const handleExportData = () => {
    try {
      exportData()
      showMessage("success", "数据导出成功")
    } catch (error) {
      showMessage("error", "数据导出失败")
    }
  }

  // 导入数据
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    importData(file)
      .then(() => {
        showMessage("success", "数据导入成功")
        // 重置文件输入
        event.target.value = ""
      })
      .catch(() => {
        showMessage("error", "数据导入失败，请检查文件格式")
        event.target.value = ""
      })
  }

  // 清空数据
  const handleClearData = () => {
    if (window.confirm("确定要清空所有数据吗？此操作不可恢复！")) {
      clearAllData()
      showMessage("success", "数据已清空")
    }
  }

  // 计算月度目标完成率
  const monthlyCompletionRate = Math.round((monthlyProgress / userSettings.monthlyGoal) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">个人中心</h1>
          <p className="text-gray-600">管理你的个人信息和设置</p>
        </div>

        {/* 消息提示 */}
        {message && (
          <Alert className={message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* 个人信息卡片 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* 用户头像和基本信息 */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {userSettings.userName.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                        用户名
                      </Label>
                      <Input
                        id="userName"
                        value={tempSettings.userName}
                        onChange={(e) => setTempSettings((prev) => ({ ...prev, userName: e.target.value }))}
                        placeholder="请输入用户名"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold text-gray-900">{userSettings.userName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      加入时间: {new Date(userSettings.joinDate).toLocaleDateString("zh-CN")}
                    </div>
                    <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                      活跃用户
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 月度目标设置 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">本月训练目标</span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="monthlyGoal" className="text-sm font-medium text-gray-700">
                      月度训练目标（天）
                    </Label>
                    <Input
                      id="monthlyGoal"
                      type="number"
                      min="1"
                      max="31"
                      value={tempSettings.monthlyGoal}
                      onChange={(e) =>
                        setTempSettings((prev) => ({ ...prev, monthlyGoal: Number.parseInt(e.target.value) || 20 }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">进度</span>
                    <span className="text-sm font-medium text-gray-900">
                      {monthlyProgress} / {userSettings.monthlyGoal} 天
                    </span>
                  </div>
                  <Progress value={monthlyCompletionRate} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">完成率</span>
                    <span
                      className={`text-sm font-bold ${
                        monthlyCompletionRate >= 100
                          ? "text-green-600"
                          : monthlyCompletionRate >= 75
                            ? "text-blue-600"
                            : monthlyCompletionRate >= 50
                              ? "text-yellow-600"
                              : "text-gray-600"
                      }`}
                    >
                      {monthlyCompletionRate}%
                    </span>
                  </div>
                  {monthlyCompletionRate >= 100 && (
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 border-green-300">🎉 目标已达成！</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mb-6">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveSettings}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    保存设置
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                    取消
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Settings className="h-4 w-4" />
                  编辑资料
                </Button>
              )}
            </div>

            {/* 统计数据网格 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{userSettings.totalTrainingDays}</div>
                <div className="text-sm text-gray-600">累计打卡</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{userSettings.totalTrainingHours}h</div>
                <div className="text-sm text-gray-600">训练时长</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据管理卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 数据统计 */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-3">本地存储状态</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">训练记录</span>
                  <Badge variant="outline">{Object.keys(trainingData).length} 条</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">存储大小</span>
                  <Badge variant="outline">
                    {Math.round(JSON.stringify({ trainingData, userSettings }).length / 1024)} KB
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">数据状态</span>
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    已同步
                  </Badge>
                </div>
              </div>
            </div>

            {/* 数据操作按钮 */}
            <div className="space-y-3">
              {/* 导出数据 */}
              <Button
                onClick={handleExportData}
                variant="outline"
                className="w-full flex items-center gap-2 hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
                导出数据备份
              </Button>

              {/* 导入数据 */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full flex items-center gap-2 hover:bg-green-50">
                  <Upload className="h-4 w-4" />
                  导入数据备份
                </Button>
              </div>

              {/* 清空数据 */}
              <Button onClick={handleClearData} variant="destructive" className="w-full flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                清空所有数据
              </Button>
            </div>

            {/* 数据说明 */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-medium">💡 数据安全提示：</p>
                <p>• 数据自动保存到浏览器本地存储</p>
                <p>• 建议定期导出数据作为备份</p>
                <p>• 导出的数据可在其他设备导入</p>
                <p>• 清空数据后无法恢复，请谨慎操作</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
