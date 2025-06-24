"use client"

import { useState } from "react"
import { Clock, Zap, Target } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckIn: (duration: number, intensity: "轻松" | "中等" | "高强度") => void
}

export function CheckInDialog({ open, onOpenChange, onCheckIn }: CheckInDialogProps) {
  const [duration, setDuration] = useState([60])
  const [intensity, setIntensity] = useState<"轻松" | "中等" | "高强度">("中等")

  const intensityOptions = [
    { label: "轻松" as const, color: "bg-green-500", description: "热身或恢复训练" },
    { label: "中等" as const, color: "bg-yellow-500", description: "常规训练强度" },
    { label: "高强度" as const, color: "bg-red-500", description: "挑战性训练" },
  ]

  const handleCheckIn = () => {
    onCheckIn(duration[0], intensity)
    // 重置表单
    setDuration([60])
    setIntensity("中等")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">训练打卡</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 训练时长 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">训练时长</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{duration[0]}</div>
                  <div className="text-sm text-gray-500">分钟</div>
                </div>
                <Slider value={duration} onValueChange={setDuration} max={180} min={15} step={15} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>15分钟</span>
                  <span>180分钟</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 训练强度 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">训练强度</span>
                </div>
                <div className="space-y-2">
                  {intensityOptions.map((option) => (
                    <div
                      key={option.label}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        intensity === option.label
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setIntensity(option.label)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                        {intensity === option.label && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            已选择
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 预估消耗 */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium">预估消耗</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(duration[0] * (intensity === "高强度" ? 6 : intensity === "中等" ? 5 : 4))} 卡路里
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 确认按钮 */}
          <Button
            onClick={handleCheckIn}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            完成打卡
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
