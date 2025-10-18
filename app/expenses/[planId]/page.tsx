'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mic, MicOff, Plus, Edit, Trash2, DollarSign, Calendar, Tag } from 'lucide-react'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  currency: string
  date: string
  created_at: string
}

interface ExpenseForm {
  category: string
  description: string
  amount: string
  date: string
}

export default function ExpensesPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.planId as string
  
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExpenseForm>({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [message, setMessage] = useState('')
  const [voiceRecognition, setVoiceRecognition] = useState({
    isListening: false,
    transcript: ''
  })
  
  const supabase = createClient()

  const categories = [
    '住宿', '餐饮', '交通', '门票', '购物', '娱乐', '其他'
  ]

  useEffect(() => {
    fetchExpenses()
  }, [planId])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('plan_id', planId)
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setMessage('获取费用记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.lang = 'zh-CN'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setVoiceRecognition({ isListening: true, transcript: '' })
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setVoiceRecognition(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript
        }))
      }

      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        setVoiceRecognition({ isListening: false, transcript: '' })
      }

      recognition.onend = () => {
        setVoiceRecognition(prev => ({ ...prev, isListening: false }))
        
        // 解析语音内容
        if (voiceRecognition.transcript) {
          parseVoiceInput(voiceRecognition.transcript)
        }
      }

      recognition.start()
    } else {
      setMessage('您的浏览器不支持语音识别功能')
    }
  }

  const parseVoiceInput = (transcript: string) => {
    const text = transcript.toLowerCase()
    
    // 提取金额
    const amountMatch = text.match(/(\d+)(?:元|块|块钱)?/)
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[1] }))
    }
    
    // 提取类别
    if (text.includes('住宿') || text.includes('酒店')) {
      setFormData(prev => ({ ...prev, category: '住宿' }))
    } else if (text.includes('吃饭') || text.includes('餐饮')) {
      setFormData(prev => ({ ...prev, category: '餐饮' }))
    } else if (text.includes('交通') || text.includes('打车') || text.includes('地铁')) {
      setFormData(prev => ({ ...prev, category: '交通' }))
    } else if (text.includes('门票') || text.includes('景点')) {
      setFormData(prev => ({ ...prev, category: '门票' }))
    } else if (text.includes('购物') || text.includes('买东西')) {
      setFormData(prev => ({ ...prev, category: '购物' }))
    }
    
    // 设置描述
    setFormData(prev => ({ ...prev, description: transcript }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const expenseData = {
        plan_id: planId,
        user_id: user.id,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: 'CNY',
        date: formData.date
      }

      if (editingExpense) {
        // 更新现有费用
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense)

        if (error) throw error
        setMessage('费用记录更新成功')
      } else {
        // 创建新费用
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData)

        if (error) throw error
        setMessage('费用记录添加成功')
      }

      // 重置表单
      setFormData({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setIsAdding(false)
      setEditingExpense(null)
      fetchExpenses()
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date
    })
    setEditingExpense(expense.id)
    setIsAdding(true)
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm('确定要删除这条费用记录吗？')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error
      setMessage('费用记录删除成功')
      fetchExpenses()
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回
              </button>
              <h1 className="text-2xl font-bold text-gray-900">费用管理</h1>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加费用
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">费用统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">¥{totalAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">总支出</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{expenses.length}</p>
              <p className="text-sm text-gray-600">记录数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {categories.length}
              </p>
              <p className="text-sm text-gray-600">类别数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {expenses.length > 0 ? (totalAmount / expenses.length).toFixed(0) : 0}
              </p>
              <p className="text-sm text-gray-600">平均费用</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingExpense ? '编辑费用记录' : '添加费用记录'}
            </h3>
            
            {/* Voice Input */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-blue-900">语音输入</h4>
                <button
                  type="button"
                  onClick={voiceRecognition.isListening ? () => setVoiceRecognition({ isListening: false, transcript: '' }) : startVoiceRecognition}
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类别
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">选择类别</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金额 (元)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="费用描述"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {message && (
                <div className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingExpense(null)
                    setFormData({
                      category: '',
                      description: '',
                      amount: '',
                      date: new Date().toISOString().split('T')[0]
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingExpense ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">费用记录</h2>
          </div>
          
          {expenses.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Tag className="h-4 w-4 mr-1" />
                          {expense.category}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mt-1">
                        {expense.description}
                      </h3>
                      <p className="text-lg font-bold text-indigo-600">
                        ¥{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">还没有费用记录</h3>
              <p className="mt-1 text-sm text-gray-500">开始记录您的旅行费用吧！</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


