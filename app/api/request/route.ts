import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? process.env.resend_api_key)
  const { name, email, asset, reason } = await req.json()

  const { error } = await resend.emails.send({
    from: 'Sales Library <onboarding@resend.dev>',
    to: 'andy.miles@docusketch.com',
    subject: `Asset request: ${asset}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Asset requested:</strong> ${asset}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
