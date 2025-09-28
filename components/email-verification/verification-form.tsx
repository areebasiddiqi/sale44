'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, AlertCircle, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationResult {
  email: string
  isValid: boolean
  score?: number
  message: string
  details?: {
    syntax: boolean
    domain: boolean
    smtp: boolean
    disposable: boolean
    role: boolean
  }
}

export function EmailVerificationForm() {
  const [singleEmail, setSingleEmail] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [results, setResults] = useState<VerificationResult[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [leadsGenerated, setLeadsGenerated] = useState(0)
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')

  const verifyEmails = async (emails: string[]) => {
    setIsVerifying(true)
    setResults([])
    setLeads([])
    setLeadsGenerated(0)

    try {
      const response = await fetch('/api/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify emails')
      }

      const data = await response.json()
      setResults(data.results)
      setLeads(data.leads || [])
      setLeadsGenerated(data.leadsGenerated || 0)
      
      if (data.leadsGenerated > 0) {
        toast.success(`Verified ${data.results.length} email(s) and generated ${data.leadsGenerated} lead(s)`)
      } else {
        toast.success(`Verified ${data.results.length} email(s)`)
      }
      
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Failed to verify emails. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSingleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!singleEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!isValidEmail(singleEmail)) {
      toast.error('Please enter a valid email format')
      return
    }

    await verifyEmails([singleEmail.trim()])
  }

  const handleBulkVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkEmails.trim()) {
      toast.error('Please enter email addresses')
      return
    }

    const emails = bulkEmails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (emails.length === 0) {
      toast.error('No valid emails found')
      return
    }

    const invalidEmails = emails.filter(email => !isValidEmail(email))
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.join(', ')}`)
      return
    }

    await verifyEmails(emails)
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setBulkEmails(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Single Email
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bulk Verification
        </button>
      </div>

      {/* Single Email Form */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleVerification} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              disabled={isVerifying}
            />
          </div>
          <Button type="submit" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Verify Email
              </>
            )}
          </Button>
        </form>
      )}

      {/* Bulk Email Form */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkVerification} className="space-y-4">
          <div>
            <Label htmlFor="bulk-emails">Email Addresses</Label>
            <Textarea
              id="bulk-emails"
              placeholder="Enter multiple emails (one per line, or separated by commas/semicolons)&#10;example1@domain.com&#10;example2@domain.com&#10;example3@domain.com"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              disabled={isVerifying}
              rows={6}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Verify Emails
                </>
              )}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isVerifying}
              />
              <Button type="button" variant="outline" disabled={isVerifying}>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Lead Generation Results */}
      {leadsGenerated > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Leads Generated Successfully!
            </CardTitle>
            <CardDescription className="text-green-700">
              {leadsGenerated} new lead(s) have been generated from verified emails and {leadsGenerated} credit(s) have been deducted.
            </CardDescription>
          </CardHeader>
          
          {leads.length > 0 && (
            <CardContent>
              <h4 className="text-sm font-medium text-green-800 mb-3">Generated Leads:</h4>
              <div className="space-y-2">
                {leads.map((lead, index) => (
                  <div key={index} className="bg-white border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.company}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Results</CardTitle>
            <CardDescription>
              {results.filter(r => r.isValid).length} valid out of {results.length} emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {result.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.email}</p>
                      <p className="text-sm text-gray-500">{result.message}</p>
                      {result.details && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.details.syntax ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Syntax: {result.details.syntax ? '✓' : '✗'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.details.domain ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Domain: {result.details.domain ? '✓' : '✗'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.details.smtp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            SMTP: {result.details.smtp ? '✓' : '✗'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.details.disposable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.details.disposable ? 'Not Disposable' : 'Disposable'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.details.role ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.details.role ? 'Personal' : 'Role-based'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {result.score && (
                      <p className="text-sm font-medium">
                        Score: {result.score}%
                      </p>
                    )}
                    <p className={`text-sm font-medium ${
                      result.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.isValid ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
