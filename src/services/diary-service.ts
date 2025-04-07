interface DiaryEntry {
  userId: string;
  content: string;
  mood: string;
  date: Date;
  tags: string[];
}

// Datos ficticios iniciales
const diaryEntries: DiaryEntry[] = [
  {
    userId: 'user123',
    content: 'Hoy fue un día productivo en el trabajo. Completé varios proyectos importantes.',
    mood: 'feliz',
    date: new Date('2024-03-20'),
    tags: ['trabajo', 'productividad']
  },
  {
    userId: 'user123',
    content: 'Me reuní con amigos para cenar. La comida estuvo deliciosa.',
    mood: 'contento',
    date: new Date('2024-03-19'),
    tags: ['amigos', 'comida']
  },
  {
    userId: 'user123',
    content: 'Día de ejercicio. Me siento cansado pero satisfecho con el entrenamiento.',
    mood: 'cansado',
    date: new Date('2024-03-18'),
    tags: ['ejercicio', 'salud']
  }
];

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  diaryEntries.push(entry);
}

export async function getDiaryEntries(
  userId: string,
  startDate: Date,
  endDate: Date,
  tags?: string[]
): Promise<DiaryEntry[]> {
  return diaryEntries.filter(entry => {
    const matchesUser = entry.userId === userId;
    const matchesDate = entry.date >= startDate && entry.date <= endDate;
    const matchesTags = !tags || tags.every(tag => entry.tags.includes(tag));
    return matchesUser && matchesDate && matchesTags;
  });
}

export async function getDiarySummary(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEntries: number;
  moodDistribution: Record<string, number>;
  topTags: Array<{ name: string; count: number }>;
}> {
  const userEntries = await getDiaryEntries(userId, startDate, endDate);

  // Calcular distribución de estados de ánimo
  const moodDistribution = userEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcular tags más usados
  const tagCounts = userEntries.reduce((acc, entry) => {
    entry.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEntries: userEntries.length,
    moodDistribution,
    topTags
  };
} 