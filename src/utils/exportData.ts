import type { FeedingLog, Baby } from '../types';
import foodsData from '../data/foods.json';

interface Food {
  id: string;
  name: string;
  category: string;
}

const foods = foodsData.foods as Food[];

export function exportLogsToCSV(logs: FeedingLog[], babies: Baby[]): string {
  const headers = [
    'Date',
    'Baby',
    'Food',
    'Category',
    'Serving Method',
    'Response',
    'Meal Time',
    'First Time',
    'Notes',
  ];

  const rows = logs.map((log) => {
    const baby = babies.find((b) => b.id === log.babyId);
    const food = foods.find((f) => f.id === log.foodId);

    return [
      log.loggedDate,
      baby?.name || 'Unknown',
      food?.name || log.customFoodName || 'Unknown',
      food?.category || 'custom',
      log.servingMethod,
      log.response,
      log.mealTime || '',
      log.isFirstTime ? 'Yes' : 'No',
      (log.notes || '').replace(/"/g, '""'), // Escape quotes
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportAndDownload(logs: FeedingLog[], babies: Baby[]): void {
  const csv = exportLogsToCSV(logs, babies);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `first-bites-export-${date}.csv`);
}
