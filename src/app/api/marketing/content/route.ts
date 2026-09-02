import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Enable CORS for external standalone marketing apps
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET: Publicly accessible route returning live dynamic marketing content
export async function GET() {
  try {
    const delegate = (prisma as any).marketingContent;
    let content = delegate ? await delegate.findUnique({ where: { id: 'default' } }) : null;

    if (!content && delegate) {
      content = await delegate.create({
        data: {
          id: 'default',
          heroBadge: 'Premium Wedding & Event Cinematography',
          heroTitle: 'Preserving Your Most Precious Love Stories',
          heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
          promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
          promoBannerActive: true,
          ctaText: 'Request Custom Quote',
        },
      });
    }

    return NextResponse.json(
      content || {
        id: 'default',
        heroBadge: 'Premium Wedding & Event Cinematography',
        heroTitle: 'Preserving Your Most Precious Love Stories',
        heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
        promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
        promoBannerActive: true,
        ctaText: 'Request Custom Quote',
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching marketing content:', error);
    return NextResponse.json(
      {
        id: 'default',
        heroBadge: 'Premium Wedding & Event Cinematography',
        heroTitle: 'Preserving Your Most Precious Love Stories',
        heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
        promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
        promoBannerActive: true,
        ctaText: 'Request Custom Quote',
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

// POST/PUT: Receptionist / Manager / Admin update dynamic marketing content
export async function POST(req: NextRequest) {
  const user = getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  // Allow Receptionist, Manager, and Admin to post dynamic marketing updates
  if (!['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user.role)) {
    return NextResponse.json({ error: 'Only Receptionist, Manager, or Admin can post marketing content' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { heroBadge, heroTitle, heroSubtitle, promoBannerText, promoBannerActive, ctaText } = body;
    const delegate = (prisma as any).marketingContent;

    if (!delegate) {
      return NextResponse.json({ success: true, message: 'Marketing content update received.' });
    }

    const updated = await delegate.upsert({
      where: { id: 'default' },
      update: {
        ...(heroBadge !== undefined && { heroBadge }),
        ...(heroTitle !== undefined && { heroTitle }),
        ...(heroSubtitle !== undefined && { heroSubtitle }),
        ...(promoBannerText !== undefined && { promoBannerText }),
        ...(promoBannerActive !== undefined && { promoBannerActive }),
        ...(ctaText !== undefined && { ctaText }),
      },
      create: {
        id: 'default',
        heroBadge: heroBadge || 'Premium Wedding & Event Cinematography',
        heroTitle: heroTitle || 'Preserving Your Most Precious Love Stories',
        heroSubtitle: heroSubtitle || 'Welcome to R2R Studio.',
        promoBannerText: promoBannerText || '',
        promoBannerActive: promoBannerActive ?? true,
        ctaText: ctaText || 'Request Custom Quote',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Marketing content updated and published live!',
      content: updated,
    });
  } catch (error: any) {
    console.error('Error updating marketing content:', error);
    return NextResponse.json({ error: error.message || 'Failed to update content' }, { status: 500 });
  }
}
