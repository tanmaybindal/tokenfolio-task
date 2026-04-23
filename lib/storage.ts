import fs from 'fs';
import path from 'path';

import { ServicesData } from '@/types';

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const DATA_PATH = path.join(DATA_DIR, 'services.json');
const TMP_PATH = DATA_PATH + '.tmp';

export function readServices(): ServicesData {
  if (!fs.existsSync(DATA_PATH)) return { services: [] };
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as ServicesData;
}

export function writeServices(data: ServicesData): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // Write to temp file first, then rename atomically.
  // Prevents corrupt JSON if the process dies mid-write.
  fs.writeFileSync(TMP_PATH, JSON.stringify(data, null, 2));
  fs.renameSync(TMP_PATH, DATA_PATH);
}
