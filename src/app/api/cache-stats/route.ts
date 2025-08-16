
import { NextResponse } from 'next/server';
import { chatCache } from '@/lib/chatCache';

export async function GET() {
  try {
    const stats = chatCache.getStats();
    
    return NextResponse.json({
      chatCache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json({ error: 'Failed to get cache stats' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    chatCache.clear();
    
    return NextResponse.json({
      message: 'Chat cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
