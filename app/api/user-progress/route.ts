import '@/models/Project';
import '@/models/Quiz';

import { NextResponse } from 'next/server';
import User from '../../../models/User';
import dbConnect from '../../../lib/mongo';

// 💥 Très important ! Tu dois importer ce fichier pour enregistrer le schema



export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await User.findById(userId)
      .populate('projectsTaken')         // OK maintenant si Project est bien importé
      .populate('quizzes.quiz')          // assure-toi que Quiz est bien importé aussi

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🧠 On retourne uniquement les champs nécessaires
    return NextResponse.json({
      projectsTaken: user.projectsTaken || [],
      quizzes: user.quizzes || [],
    });
  } catch (error: any) {
    console.error('Erreur API user-progress:', error.message || error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
