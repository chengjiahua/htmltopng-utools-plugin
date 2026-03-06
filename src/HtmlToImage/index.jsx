import { useState, useEffect, useRef } from 'react'
import './index.css'

export default function HtmlToImage ({ enterAction }) {
  const [htmlContent, setHtmlContent] = useState('<h2>探索无限可能</h2>\n<p>你可以直接导入一个 HTML 文件，或者在这里编写代码。支持所有的 CSS 行内样式。</p>\n<ul style="margin-top:10px">\n  <li>🚀 快速渲染</li>\n  <li>🎨 高级审美</li>\n  <li>📸 高清导出</li>\n</ul>')
  const [bgColor, setBgColor] = useState('#6366f1')
  const [cardBgColor, setCardBgColor] = useState('#ffffff')
  const [padding, setPadding] = useState(30)
  const [radius, setRadius] = useState(20)
  const [shadow, setShadow] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  
  const renderAreaRef = useRef(null)
  const captureTargetRef = useRef(null)
  const contentCardRef = useRef(null)

  // 初始化 html2canvas
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 处理 uTools 传入的文件
  useEffect(() => {
    console.log('HtmlToImage enterAction:', enterAction)
    if (enterAction && enterAction.payload && enterAction.payload.paths) {
      const filePath = enterAction.payload.paths[0]
      console.log('Reading file:', filePath)
      try {
        const fs = window.require('fs')
        const content = fs.readFileSync(filePath, 'utf8')
        console.log('File content loaded, length:', content.length)
        setHtmlContent(content)
      } catch (err) {
        console.error('读取文件失败:', err)
      }
    }
  }, [enterAction])

  // 实时预览
  useEffect(() => {
    if (renderAreaRef.current) {
      renderAreaRef.current.innerHTML = htmlContent
    }
  }, [htmlContent])

  // 处理文件导入
  const handleFile = (file) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      setHtmlContent(content)
    }
    reader.readAsText(file)
  }

  // 拖拽事件处理
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // 导出图片
  const exportImage = async () => {
    const btn = document.querySelector('.btn-export')
    btn.style.opacity = '0.7'
    btn.innerText = '⚡ 正在渲染...'
    
    try {
      // 确保 html2canvas 已加载
      if (!window.html2canvas) {
        throw new Error('html2canvas 未加载')
      }
      
      // 确保内容完整显示
      const contentCard = contentCardRef.current
      if (contentCard) {
        // 保存原始样式
        const originalHeight = contentCard.style.height
        const originalMaxHeight = contentCard.style.maxHeight
        const originalOverflow = contentCard.style.overflow
        
        // 调整内容卡片高度以适应所有内容
        contentCard.style.height = 'auto'
        contentCard.style.maxHeight = 'none'
        contentCard.style.overflow = 'visible'
        
        // 强制重新计算布局
        contentCard.offsetHeight
      }
      
      const canvas = await window.html2canvas(captureTargetRef.current, {
        backgroundColor: null,
        scale: 3, // 3倍采样，极度清晰
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: captureTargetRef.current.scrollWidth,
        windowHeight: captureTargetRef.current.scrollHeight
      })

      const link = document.createElement('a')
      link.download = `MagicSnap_${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error(err)
      alert("生成失败，请检查 HTML 内容或图片跨域问题")
    } finally {
      btn.style.opacity = '1'
      btn.innerText = '生成高清 PNG'
    }
  }

  // 自动判断对比色
  const getTextColor = (bgColor) => {
    const r = parseInt(bgColor.substr(1, 2), 16)
    const g = parseInt(bgColor.substr(3, 2), 16)
    const b = parseInt(bgColor.substr(5, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 125 ? '#1e293b' : '#ffffff'
  }

  // 计算卡片尺寸和内边距
  const getCardStyle = () => {
    // 内边距范围 0-100
    const paddingPercent = padding / 100;
    // 当内边距最大时，卡片占3/4长度；最小时，卡片占100%长度
    const cardWidthPercent = 1 - (paddingPercent * 0.75);
    const cardWidth = `${cardWidthPercent * 100}%`;
    
    if (padding === 0) {
      return {
        backgroundColor: cardBgColor,
        color: getTextColor(cardBgColor),
        padding: '20px',
        borderRadius: '0px',
        boxShadow: 'none',
        width: '100%',
        height: '100%',
        margin: 0,
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'auto'
      };
    }
    
    return {
      backgroundColor: cardBgColor,
      color: getTextColor(cardBgColor),
      padding: '5%',
      borderRadius: `${radius}px`,
      boxShadow: `0 ${shadow/2}px ${shadow}px rgba(0,0,0,${shadow/150 + 0.2})`,
      width: cardWidth,
      maxHeight: '100%'
    };
  };

  return (
    <div className="app-container">
      <div className="container">
        {/* 左侧 */}
        <div className="controls">
          {/* 文件导入区 */}
          <div 
            className={`upload-zone ${isDragging ? 'dragover' : ''}`} 
            id="drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              id="file-input" 
              accept=".html,.txt,.htm"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div id="upload-text">
              <p>📄 拖拽 HTML 文件至此 或 <b>点击上传</b></p>
            </div>
          </div>

          <div className="input-group">
            <label>HTML 代码编辑</label>
            <textarea 
              id="html-input" 
              placeholder="在此输入代码..."
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
            />
          </div>

          <div className="setting-grid">
            <div className="input-group">
              <label>画布背景</label>
              <input 
                type="color" 
                id="bg-color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>卡片背景</label>
              <input 
                type="color" 
                id="card-bg-color" 
                value={cardBgColor}
                onChange={(e) => setCardBgColor(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>内边距</label>
              <input 
                type="range" 
                id="padding-range" 
                min="0" 
                max="100" 
                value={padding}
                onChange={(e) => setPadding(parseInt(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label>卡片圆角</label>
              <input 
                type="range" 
                id="radius-range" 
                min="0" 
                max="50" 
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label>阴影深度</label>
              <input 
                type="range" 
                id="shadow-range" 
                min="0" 
                max="100" 
                value={shadow}
                onChange={(e) => setShadow(parseInt(e.target.value))}
              />
            </div>
          </div>

          <button className="btn-export" onClick={exportImage}>生成高清 PNG</button>
        </div>

        {/* 右侧 */}
        <div className="preview-area">
          <div 
            id="capture-target" 
            ref={captureTargetRef}
            style={{
              backgroundColor: bgColor,
              padding: padding === 0 ? '0px' : `${padding}px`,
              borderRadius: padding === 0 ? '0px' : '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              overflow: 'auto'
            }}
          >
            <div 
              id="content-card" 
              ref={contentCardRef}
              style={getCardStyle()}
            >
              <div className="window-dots">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div id="html-render-area" ref={renderAreaRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}