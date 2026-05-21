// ============================================================
// TalentFlow — IndexedDB Layer (via idb)
// ============================================================

import { openDB, type IDBPDatabase } from 'idb';
import type {
  CandidateRecord,
  MatchResultRecord,
  InterviewRecord,
} from '@/types';

/** Database schema definition */
interface TalentFlowDB {
  candidates: {
    key: string;
    value: CandidateRecord;
    indexes: {
      'by-name': string;
      'by-email': string;
      'by-created': string;
    };
  };
  matches: {
    key: string;
    value: MatchResultRecord;
    indexes: { 'by-candidate': string };
  };
  interviews: {
    key: string;
    value: InterviewRecord;
    indexes: { 'by-candidate': string };
  };
  files: {
    key: string;
    value: { candidateId: string; blob: Blob };
  };
}

const DB_NAME = 'talentflow-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<TalentFlowDB> | null = null;

/** Get or open the database singleton. */
async function getDB(): Promise<IDBPDatabase<TalentFlowDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<TalentFlowDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // candidates store
      if (!db.objectStoreNames.contains('candidates')) {
        const candidateStore = db.createObjectStore('candidates', {
          keyPath: 'id',
        });
        candidateStore.createIndex('by-name', 'profile.name');
        candidateStore.createIndex('by-email', 'profile.email');
        candidateStore.createIndex('by-created', 'createdAt');
      }

      // matches store
      if (!db.objectStoreNames.contains('matches')) {
        const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchStore.createIndex('by-candidate', 'candidateId');
      }

      // interviews store
      if (!db.objectStoreNames.contains('interviews')) {
        const interviewStore = db.createObjectStore('interviews', {
          keyPath: 'id',
        });
        interviewStore.createIndex('by-candidate', 'candidateId');
      }

      // files store (raw resume blobs, keyed by candidateId)
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'candidateId' });
      }
    },
  });
  return dbInstance;
}

// ============================================================
// Candidate CRUD
// ============================================================

/** Get all candidates sorted by creation date (ascending). */
export async function getAllCandidates(): Promise<CandidateRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('candidates', 'by-created');
}

/** Get a single candidate by ID. */
export async function getCandidate(
  id: string
): Promise<CandidateRecord | undefined> {
  const db = await getDB();
  return db.get('candidates', id);
}

/** Create or update a candidate record. */
export async function putCandidate(candidate: CandidateRecord): Promise<void> {
  const db = await getDB();
  await db.put('candidates', candidate);
}

/** Delete a candidate and all related data (matches, interviews, files). */
export async function deleteCandidate(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['candidates', 'matches', 'interviews', 'files'],
    'readwrite'
  );

  // Delete the candidate itself
  tx.objectStore('candidates').delete(id);

  // Delete related matches
  const matchIndex = tx.objectStore('matches').index('by-candidate');
  let matchCursor = await matchIndex.openCursor(id);
  while (matchCursor) {
    matchCursor.delete();
    matchCursor = await matchCursor.continue();
  }

  // Delete related interviews
  const interviewIndex = tx
    .objectStore('interviews')
    .index('by-candidate');
  let interviewCursor = await interviewIndex.openCursor(id);
  while (interviewCursor) {
    interviewCursor.delete();
    interviewCursor = await interviewCursor.continue();
  }

  // Delete the file blob
  tx.objectStore('files').delete(id);

  await tx.done;
}

// ============================================================
// Match CRUD
// ============================================================

/** Get all match results for a given candidate. */
export async function getMatchesByCandidate(
  candidateId: string
): Promise<MatchResultRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-candidate', candidateId);
}

/** Create or update a match result record. */
export async function putMatch(match: MatchResultRecord): Promise<void> {
  const db = await getDB();
  await db.put('matches', match);
}

/** Get all match results across all candidates. */
export async function getAllMatches(): Promise<MatchResultRecord[]> {
  const db = await getDB();
  return db.getAll('matches');
}

// ============================================================
// Interview CRUD
// ============================================================

/** Get all interview records for a given candidate. */
export async function getInterviewsByCandidate(
  candidateId: string
): Promise<InterviewRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('interviews', 'by-candidate', candidateId);
}

/** Create or update an interview record. */
export async function putInterview(interview: InterviewRecord): Promise<void> {
  const db = await getDB();
  await db.put('interviews', interview);
}

/** Get all interview records across all candidates. */
export async function getAllInterviews(): Promise<InterviewRecord[]> {
  const db = await getDB();
  return db.getAll('interviews');
}

// ============================================================
// File (Blob) CRUD
// ============================================================

/** Get the raw resume blob for a given candidate. */
export async function getFile(candidateId: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('files', candidateId);
  return record?.blob;
}

/** Store a raw resume blob for a given candidate. */
export async function putFile(
  candidateId: string,
  blob: Blob
): Promise<void> {
  const db = await getDB();
  await db.put('files', { candidateId, blob });
}

/** Delete the raw resume blob for a given candidate. */
export async function deleteFile(candidateId: string): Promise<void> {
  const db = await getDB();
  await db.delete('files', candidateId);
}
