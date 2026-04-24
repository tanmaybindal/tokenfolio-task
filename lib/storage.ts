import fs from 'fs';
import os from 'os';
import path from 'path';

import { ServicesData } from '@/types';

const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'tokenfolio-task-data');

function canUseDataDir(dir: string): boolean {
  try {
    if (fs.existsSync(dir)) {
      return fs.statSync(dir).isDirectory() && fs.accessSync(dir, fs.constants.W_OK) === undefined;
    }
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function resolveDataDir(): string {
  const preferred = process.env.DATA_DIR;
  if (preferred && canUseDataDir(preferred)) return preferred;
  if (!preferred && canUseDataDir(DEFAULT_DATA_DIR)) return DEFAULT_DATA_DIR;
  if (canUseDataDir(FALLBACK_DATA_DIR)) return FALLBACK_DATA_DIR;
  return DEFAULT_DATA_DIR;
}

const DATA_DIR = resolveDataDir();
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
