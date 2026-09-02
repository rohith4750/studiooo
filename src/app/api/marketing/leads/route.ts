import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Enable CORS for external marketing websites (e.g. WordPress, Webflow, React, HTML forms)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, email, event, eventDate, budget, source, notes } = body;

    // Validate required fields
    if (!name || !phone || !event) {
      return NextResponse.json(
        { error: 'Name, Phone number, and Event type are required.' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Format event date (fallback to today if missing/invalid)
    const formattedDate = eventDate ? String(eventDate).trim() : new Date().toISOString().split('T')[0];

    // Create Lead in CRM database
    const newLead = await prisma.lead.create({
      data: {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : null,
        event: String(event).trim(),
        eventDate: formattedDate,
        budget: budget ? parseFloat(String(budget)) : null,
        source: source ? String(source).toUpperCase() : 'WEBSITE',
        status: 'NEW',
        notes: notes ? String(notes).trim() : 'Submitted from R2R Marketing Website Form',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry received successfully! Our team will contact you shortly.',
        leadId: newLead.id,
      },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error recording public lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit inquiry. Please try again.' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
