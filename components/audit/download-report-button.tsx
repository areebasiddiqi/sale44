'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { saveAs } from 'file-saver'

interface DownloadReportButtonProps {
  auditId: string
  businessName?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  children?: React.ReactNode
}

export function DownloadReportButton({ 
  auditId, 
  businessName, 
  size = 'sm', 
  variant = 'outline',
  children
}: DownloadReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const downloadUrl = `/audits/${auditId}/report`
      console.log('Starting download using file-saver:', downloadUrl)
      
      // Fetch the PDF
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in to download the report')
          return
        }
        if (response.status === 404) {
          toast.error('Audit not found')
          return
        }
        if (response.status === 400) {
          toast.error('Audit not completed yet')
          return
        }
        throw new Error(`Server responded with ${response.status}`)
      }

      // Get the PDF blob
      const blob = await response.blob()
      console.log('Received blob:', {
        size: blob.size,
        type: blob.type
      })
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Received empty PDF file')
      }
      
      // Create filename
      const filename = `audit-report-${businessName || 'business'}-${new Date().toISOString().split('T')[0]}.pdf`
      console.log('Saving file as:', filename)
      
      // Use file-saver to download the PDF
      saveAs(blob, filename)
      
      console.log('Download initiated successfully')
      toast.success('Report downloaded successfully!')
      
    } catch (error) {
      console.error('Download error:', error)
      
      // Fallback: Try opening in new window
      try {
        console.log('Trying fallback method (new tab)...')
        const newWindow = window.open(`/audits/${auditId}/report`, '_blank')
        if (newWindow) {
          toast.success('Report opened in new tab - you can save it from there')
        } else {
          toast.error('Please allow popups and try again')
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        toast.error('Failed to download report. Please try again or check your browser settings.')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button 
      size={size} 
      variant={variant} 
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <Download className="w-4 h-4 mr-2" />
      {isDownloading ? 'Downloading...' : (children || 'Report')}
    </Button>
  )
}
