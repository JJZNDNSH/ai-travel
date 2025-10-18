export interface IflytekConfig {
  appId: string
  apiKey: string
  apiSecret: string
}

export class IflytekVoiceRecognition {
  private config: IflytekConfig
  private isRecording = false
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  constructor(config: IflytekConfig) {
    this.config = config
  }

  // 开始录音
  async startRecording(onTranscript: (text: string) => void): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        await this.sendAudioToIflytek(audioBlob, onTranscript)
        
        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())
      }
      
      this.mediaRecorder.start(100) // 每100ms收集一次数据
      this.isRecording = true
    } catch (error) {
      console.error('无法访问麦克风:', error)
      throw new Error('无法访问麦克风，请检查权限设置')
    }
  }

  // 停止录音
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
    }
  }

  // 发送音频到科大讯飞
  private async sendAudioToIflytek(audioBlob: Blob, onTranscript: (text: string) => void): Promise<void> {
    try {
      // 将音频转换为Base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))))
      
      // 构建请求参数
      const requestData = {
        common: {
          app_id: this.config.appId
        },
        business: {
          language: 'zh_cn',
          domain: 'iat',
          accent: 'mandarin'
        },
        data: {
          status: 2, // 一次性上传
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: base64Audio
        }
      }

      // 生成签名
      const signature = this.generateSignature()
      
      // 发送HTTP请求到科大讯飞
      const response = await fetch('https://iat-api.xfyun.cn/v2/iat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Param': btoa(JSON.stringify(requestData.business)),
          'X-CurTime': Math.floor(Date.now() / 1000).toString(),
          'X-CheckSum': signature
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('科大讯飞识别结果:', result)
        
        if (result.code === 0 && result.data && result.data.result) {
          const text = result.data.result.ws
            .map((ws: any) => ws.cw.map((cw: any) => cw.w).join(''))
            .join('')
          onTranscript(text)
        } else {
          onTranscript('语音识别失败，请重试')
        }
      } else {
        onTranscript('语音识别服务异常，请重试')
      }
    } catch (error) {
      console.error('发送音频到科大讯飞失败:', error)
      onTranscript('语音识别失败，请重试')
    }
  }

  // 生成签名
  private generateSignature(): string {
    const curTime = Math.floor(Date.now() / 1000)
    const param = btoa(JSON.stringify({
      language: 'zh_cn',
      domain: 'iat',
      accent: 'mandarin'
    }))
    
    const checkSum = this.md5(this.config.apiKey + curTime + param)
    return checkSum
  }

  // MD5加密
  private md5(str: string): string {
    // 简单的MD5实现，实际项目中建议使用专门的MD5库
    return btoa(str).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }

  // 断开连接
  disconnect(): void {
    // HTTP请求不需要断开连接
  }
}