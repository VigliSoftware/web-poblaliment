import { requireSql } from './db';
import { type Novelties, NoveltyError } from './novelties';

export type NoveltiesRecord = { data: Novelties; revision: number };

export async function loadNovelties(): Promise<NoveltiesRecord> {
  const [row] = await requireSql()`SELECT data, revision FROM site_novelties WHERE id = 1`;
  if (!row) throw new Error('Run pnpm db:setup to migrate novelties');
  return row as NoveltiesRecord;
}

export async function saveNovelties(data: Novelties, revision: number) {
  const rows = await requireSql()`UPDATE site_novelties SET data = ${JSON.stringify(data)}::jsonb,
    revision = revision + 1 WHERE id = 1 AND revision = ${revision} RETURNING revision`;
  if (!rows.length)
    throw new NoveltyError('Una altra sessió ha fet canvis. Recarrega la pàgina abans de desar.');
}
