/**
 * Export chart as PNG image
 */
export async function exportChartAsPNG(
  svgElement: SVGSVGElement,
  filename: string = 'earnings-chart.png'
): Promise<void> {
  try {
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement)
    
    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    
    // Set canvas size (scale up for better quality)
    const scale = 2
    canvas.width = svgElement.clientWidth * scale
    canvas.height = svgElement.clientHeight * scale
    ctx.scale(scale, scale)
    
    // Create image from SVG
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Fill white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale)
        
        // Draw SVG
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        
        // Convert to PNG and download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create image blob'))
            return
          }
          
          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(downloadUrl)
          resolve()
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not load SVG image'))
      }
      
      img.src = url
    })
  } catch (error) {
    console.error('Error exporting chart:', error)
    throw error
  }
}

/**
 * Export chart as SVG file
 */
export function exportChartAsSVG(
  svgElement: SVGSVGElement,
  filename: string = 'earnings-chart.svg'
): void {
  try {
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement)
    
    // Add XML declaration and styling
    const svgWithStyles = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgData}`
    
    // Create blob and download
    const blob = new Blob([svgWithStyles], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting SVG:', error)
    throw error
  }
}

/**
 * Copy chart as image to clipboard (modern browsers only)
 */
export async function copyChartToClipboard(svgElement: SVGSVGElement): Promise<void> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported in this browser')
  }
  
  try {
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement)
    
    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    
    // Set canvas size
    const scale = 2
    canvas.width = svgElement.clientWidth * scale
    canvas.height = svgElement.clientHeight * scale
    ctx.scale(scale, scale)
    
    // Create image from SVG
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        // Fill white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale)
        
        // Draw SVG
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Could not create image blob'))
            return
          }
          
          try {
            // Copy to clipboard
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ])
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not load SVG image'))
      }
      
      img.src = url
    })
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    throw error
  }
}
