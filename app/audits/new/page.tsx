'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BarChart3, Globe, Loader2 } from 'lucide-react'
import { validateUrl, normalizeUrl } from '@/lib/utils'

export default function NewAuditPage() {
  const [businessUrl, setBusinessUrl] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!businessUrl.trim()) {
      toast.error('Please enter a business URL')
      return
    }

    if (!validateUrl(businessUrl)) {
      toast.error('Please enter a valid URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_url: businessUrl.trim(),
          business_name: businessName.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create audit')
      }

      toast.success('Audit created successfully!')
      router.push(`/audits/${data.audit.id}`)
    } catch (error) {
      console.error('Error creating audit:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create audit')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setBusinessUrl(url)
    
    // Auto-extract business name from URL
    if (url && !businessName) {
      const normalized = normalizeUrl(url)
      const domain = normalized.split('/')[0]
      const name = domain.replace(/\.(com|org|net|io|co|biz)$/, '')
      setBusinessName(name.charAt(0).toUpperCase() + name.slice(1))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">New Business Audit</h1>
        <p className="text-gray-600 mt-2">
          Analyze a business across 6 key parameters to uncover opportunities and weaknesses
        </p>
      </div>

      {/* Audit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Business Information
          </CardTitle>
          <CardDescription>
            Enter the business details to start the comprehensive audit process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="businessUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Business Website URL *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="businessUrl"
                  type="text"
                  value={businessUrl}
                  onChange={handleUrlChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com or example.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the main website URL of the business you want to audit
              </p>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name (Optional)
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Business name (auto-detected from URL)"
              />
              <p className="text-xs text-gray-500 mt-1">
                If left empty, we'll try to detect the business name automatically
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Audit...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Start Audit Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Audit Process Info */}
      <Card>
        <CardHeader>
          <CardTitle>What We Analyze</CardTitle>
          <CardDescription>
            Our comprehensive audit covers 6 key business parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Website & Digital Presence (30%)</h4>
                <p className="text-xs text-gray-600">Design, SEO, mobile-friendliness, conversion paths</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Market Visibility & Reputation (25%)</h4>
                <p className="text-xs text-gray-600">Social media, reviews, customer engagement</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Business Operations & Scalability (20%)</h4>
                <p className="text-xs text-gray-600">Technology stack, automation, infrastructure</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Competitive Positioning (15%)</h4>
                <p className="text-xs text-gray-600">Market differentiation, unique value proposition</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Data & Insight Capability (10%)</h4>
                <p className="text-xs text-gray-600">Analytics, tracking, performance metrics</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Compliance & Risk Management (10%)</h4>
                <p className="text-xs text-gray-600">Privacy policies, security, regulatory compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Time */}
      <div className="text-center text-sm text-gray-500">
        <p>⏱️ Estimated analysis time: 30-60 seconds</p>
        <p>📊 You'll receive a detailed report with actionable insights</p>
      </div>
    </div>
  )
}
