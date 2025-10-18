'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, MapPin, Calendar, Users, DollarSign, Heart } from 'lucide-react'
import { IflytekVoiceRecognition } from '@/lib/voice/iflytek'

interface VoiceRecognition {
  isListening: boolean
  transcript: string
}

export default function PlannerPage() {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '1',
    preferences: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognition>({
    isListening: false,
    transcript: ''
  })
  
  const router = useRouter()
  const iflytekRef = useRef<IflytekVoiceRecognition | null>(null)

  useEffect(() => {
    // 初始化科大讯飞语音识别
    const config = {
      appId: process.env.NEXT_PUBLIC_IFLYTEK_APP_ID || '',
      apiKey: process.env.NEXT_PUBLIC_IFLYTEK_API_KEY || '',
      apiSecret: process.env.NEXT_PUBLIC_IFLYTEK_API_SECRET || ''
    }
    
    if (config.appId && config.apiKey && config.apiSecret) {
      iflytekRef.current = new IflytekVoiceRecognition(config)
    }

    return () => {
      if (iflytekRef.current) {
        iflytekRef.current.disconnect()
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startVoiceRecognition = async () => {
    // 优先使用浏览器原生语音识别，更简单可靠
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setVoiceRecognition({ isListening: true, transcript: '' })
        setMessage('请开始说话...')
      }

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript
        console.log('语音识别结果:', transcript)
        
        setVoiceRecognition(prev => ({
          ...prev,
          transcript: transcript
        }))
        
        // 使用智谱大模型解析语音内容
        try {
          setMessage('正在解析语音内容...')
          
          const response = await fetch('/api/parse-voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript }),
          })

          if (response.ok) {
            const parsedData = await response.json()
            console.log('智谱解析结果:', parsedData)
            
            setFormData(prev => ({
              ...prev,
              ...(parsedData.destination && { destination: parsedData.destination }),
              ...(parsedData.startDate && { startDate: parsedData.startDate }),
              ...(parsedData.endDate && { endDate: parsedData.endDate }),
              ...(parsedData.budget && { budget: parsedData.budget.toString() }),
              ...(parsedData.travelers && { travelers: parsedData.travelers.toString() }),
              ...(parsedData.preferences && { preferences: parsedData.preferences })
            }))
            
            setMessage('语音识别成功，已自动填充表单')
          } else {
            const errorData = await response.json()
            setMessage('语音解析失败：' + errorData.error)
          }
        } catch (error) {
          console.error('语音解析错误:', error)
          setMessage('语音解析失败，请重试')
        }
      }

      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        setMessage('语音识别出错，请重试')
        setVoiceRecognition({ isListening: false, transcript: '' })
      }

      recognition.onend = () => {
        setVoiceRecognition(prev => ({ ...prev, isListening: false }))
      }

      recognition.start()
    } else if (iflytekRef.current) {
      // 备用：使用科大讯飞
      try {
        setVoiceRecognition({ isListening: true, transcript: '' })
        
        await iflytekRef.current.startRecording(async (text: string) => {
          setVoiceRecognition(prev => ({
            ...prev,
            transcript: text
          }))
          
          // 使用智谱大模型解析语音内容
          try {
            setMessage('正在解析语音内容...')
            
            const response = await fetch('/api/parse-voice', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ transcript: text }),
            })

            if (response.ok) {
              const parsedData = await response.json()
              console.log('智谱解析结果:', parsedData)
              
              setFormData(prev => ({
                ...prev,
                ...(parsedData.destination && { destination: parsedData.destination }),
                ...(parsedData.startDate && { startDate: parsedData.startDate }),
                ...(parsedData.endDate && { endDate: parsedData.endDate }),
                ...(parsedData.budget && { budget: parsedData.budget.toString() }),
                ...(parsedData.travelers && { travelers: parsedData.travelers.toString() }),
                ...(parsedData.preferences && { preferences: parsedData.preferences })
              }))
              
              setMessage('语音识别成功，已自动填充表单')
            } else {
              const errorData = await response.json()
              setMessage('语音解析失败：' + errorData.error)
            }
          } catch (error) {
            console.error('语音解析错误:', error)
            setMessage('语音解析失败，请重试')
          }
        })
      } catch (error) {
        console.error('科大讯飞语音识别启动失败:', error)
        setMessage('语音识别启动失败，请检查麦克风权限')
        setVoiceRecognition({ isListening: false, transcript: '' })
      }
    } else {
      setMessage('您的浏览器不支持语音识别功能')
    }
  }


  const stopVoiceRecognition = () => {
    // 浏览器原生语音识别会自动停止，无需手动停止
    // 科大讯飞需要手动停止
    if (iflytekRef.current) {
      iflytekRef.current.stopRecording()
    }
    setVoiceRecognition(prev => ({ ...prev, isListening: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: parseFloat(formData.budget),
          travelers: parseInt(formData.travelers),
          preferences: formData.preferences,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create plan')
      }

      const plan = await response.json()
      router.push(`/plans/${plan.id}`)
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">AI 旅行规划器</h1>
            <p className="mt-1 text-sm text-gray-600">
              告诉我您的旅行需求，AI 将为您生成详细的旅行计划
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* 语音输入区域 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">语音输入</h3>
                <button
                  type="button"
                  onClick={voiceRecognition.isListening ? stopVoiceRecognition : startVoiceRecognition}
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    voiceRecognition.isListening
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {voiceRecognition.isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-1" />
                      停止录音
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-1" />
                      开始录音
                    </>
                  )}
                </button>
              </div>
              
              {voiceRecognition.transcript && (
                <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                  {voiceRecognition.transcript}
                </div>
              )}
              
              <p className="text-xs text-blue-600 mt-2">
                支持语音描述旅行需求，如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
              </p>
            </div>

            {/* 表单字段 */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                  目的地 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="destination"
                    required
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入目的地，如：日本、韩国、泰国"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    出发日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="startDate"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    返回日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="endDate"
                      required
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                    预算 (元) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="budget"
                      required
                      min="1"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="travelers" className="block text-sm font-medium text-gray-700">
                    同行人数 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="travelers"
                      required
                      min="1"
                      value={formData.travelers}
                      onChange={(e) => handleInputChange('travelers', e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                  旅行偏好
                </label>
                <div className="mt-1 relative">
                  <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="preferences"
                    rows={3}
                    value={formData.preferences}
                    onChange={(e) => handleInputChange('preferences', e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请描述您的旅行偏好，如：喜欢美食、购物、文化历史、自然风光、亲子游等"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? '生成中...' : '生成旅行计划'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

