import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const audioPath = path.join(process.cwd(), 'public', 'audio', 'audio.wav');
    const lipsyncPath = path.join(process.cwd(), 'public', 'data', 'lipSync.json');

    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      console.log('Deleted audio file');
    }

    if (fs.existsSync(lipsyncPath)) {
      fs.writeFileSync(lipsyncPath, "{}");
    }
    
    return NextResponse.json({ success: true, message: 'Files cleared successfully' });
  } catch (error) {
    console.error('Error clearing files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear files' },
      { status: 500 }
    );
  }
}