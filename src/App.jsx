import { useEffect, useState } from 'react'
import Hello from './Hello'
import Read from './Read'
import Write from './Write'
import HtmlToImage from './HtmlToImage'

export default function App () {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')

  useEffect(() => {
    console.log('App mounted')
    window.utools.onPluginEnter((action) => {
      console.log('Plugin enter action:', action)
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      console.log('Plugin out, isKill:', isKill)
      setRoute('')
    })
  }, [])

  if (route === 'hello') {
    return <Hello enterAction={enterAction} />
  }

  if (route === 'read') {
    return <Read enterAction={enterAction} />
  }

  if (route === 'write') {
    return <Write enterAction={enterAction} />
  }

  console.log('Current route:', route)
  
  if (route === 'html-to-image') {
    console.log('Rendering HtmlToImage component')
    return <HtmlToImage enterAction={enterAction} />
  }

  // 默认显示 HTML 转图片功能
  console.log('Rendering default HtmlToImage component')
  return <HtmlToImage enterAction={enterAction} />
}
