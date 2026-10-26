import Database from 'better-sqlite3';

function createCoreTables(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'usr_default',
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      location TEXT NOT NULL,
      total_budget REAL NOT NULL,
      currency TEXT NOT NULL,
      preferences TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE TABLE IF NOT EXISTS budget_items (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      estimated REAL NOT NULL,
      actual REAL NOT NULL,
      vendor_id TEXT,
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);
  `);
}

function createSecondaryTables(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS timeline_tasks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      depends_on TEXT NOT NULL,
      category TEXT NOT NULL,
      assignee TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_timeline_tasks_event_id ON timeline_tasks(event_id);
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      quote REAL NOT NULL,
      status TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);
    CREATE TABLE IF NOT EXISTS idea_sets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      theme TEXT NOT NULL,
      decor TEXT NOT NULL,
      menu TEXT NOT NULL,
      activities TEXT NOT NULL,
      generated_metadata TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_idea_sets_event_id ON idea_sets(event_id);
  `);
}

export function bootstrapSqlite(sqlite: Database.Database): void {
  sqlite.pragma('foreign_keys = ON');
  createCoreTables(sqlite);
  createSecondaryTables(sqlite);
}
