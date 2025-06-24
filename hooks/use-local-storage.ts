"use client"

import { useState, useEffect } from "react"

// 通用的localStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值的函数
  const getStoredValue = (): T => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // 状态初始化
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 在客户端加载时获取存储的值
  useEffect(() => {
    setStoredValue(getStoredValue())
  }, [])

  // 设置值的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // 保存到状态
      setStoredValue(valueToStore)

      // 保存到localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
