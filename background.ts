import activeIcon from "data-base64:~assets/icon.png"

import { getDomainGroups } from "~storage/domain-groups"

const createIconFromBase64 = (base64: string, active: boolean) => {
  return new Promise<ImageData>((resolve) => {
    const canvas = new OffscreenCanvas(16, 16)
    const ctx = canvas.getContext("2d")

    fetch(base64)
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        // 绘制原始图像
        ctx.drawImage(bitmap, 0, 0, 16, 16)

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, 16, 16)
        const data = imageData.data

        // 如果是非活跃状态，转换为灰度
        if (!active) {
          for (let i = 0; i < data.length; i += 4) {
            // 计算灰度值
            const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11
            data[i] = gray // R
            data[i + 1] = gray // G
            data[i + 2] = gray // B
            // Alpha 通道保持不变
          }
        }

        resolve(imageData)
      })
  })
}

let activeIconImage: ImageData | null = null
let inactiveIconImage: ImageData | null = null

// 预先处理两种状态的图标
const initializeIcons = async () => {
  activeIconImage = await createIconFromBase64(activeIcon, true)
  inactiveIconImage = await createIconFromBase64(activeIcon, false)
}

const updateIconState = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId)
  if (!tab.url) {
    return
  }

  try {
    // 确保图标已经初始化
    if (!activeIconImage || !inactiveIconImage) {
      await initializeIcons()
    }

    const currentHost = new URL(tab.url).host
    const groups = await getDomainGroups()

    const isActive = groups.some((group) =>
      Object.values(group.environments).some(
        (env?: { domain: string; protocol: string }) =>
          env?.domain?.toLowerCase() === currentHost.toLowerCase()
      )
    )

    await chrome.action.setIcon({
      imageData: isActive ? activeIconImage : inactiveIconImage
    })
  } catch (e) {
    console.error("Error updating icon:", e)
    await chrome.action.setIcon({
      imageData: inactiveIconImage
    })
  }
}

// 初始化图标
initializeIcons()

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateIconState(activeInfo.tabId)
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    await updateIconState(tabId)
  }
})
