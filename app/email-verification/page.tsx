import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'
import { EmailVerificationForm } from '@/components/email-verification/verification-form'

async function getUserVerifications(userId: string) {
  const supabase = createClient()
  
  const { data: verifications, error } = await supabase
    .from('email_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching email verifications:', error)
    return []
  }

  return verifications || []
}

export default async function EmailVerificationPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const verifications = await getUserVerifications(user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
          <p className="text-gray-600">Verify email addresses to ensure they are valid and deliverable</p>
        </div>
      </div>

      {/* Email Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Verify Email Addresses
          </CardTitle>
          <CardDescription>
            Verify email addresses using SMTP ping, MX record lookup, and advanced validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailVerificationForm />
        </CardContent>
      </Card>

      {/* Recent Verifications */}
      {verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
            <CardDescription>
              Your recent email verification results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verifications.slice(0, 10).map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {verification.is_valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : verification.is_valid === false ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{verification.email}</p>
                      <p className="text-sm text-gray-500">
                        {verification.result_message || 'Verification completed'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                    {verification.deliverable_score && (
                      <p className="text-sm font-medium">
                        Score: {verification.deliverable_score}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {verifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No verifications yet</h3>
            <p className="text-gray-600 mb-6">
              Start by verifying your first email address to check its validity and deliverability.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
