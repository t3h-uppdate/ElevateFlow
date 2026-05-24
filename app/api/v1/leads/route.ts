import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/apiKey';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const companyId = await validateApiKey(apiKey);
  
  if (!companyId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const body = await req.json();

  // Här kan du trigga ElevateFlow AI med companyId
  // Exempel: await createLeadWithAI(companyId, body);

  return NextResponse.json({ success: true, companyId });
}
