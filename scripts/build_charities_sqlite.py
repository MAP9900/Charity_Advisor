"""
Create a SQLite database from the cleaned IRS charities CSV produced in Step 1.

Usage:
    python scripts/build_charities_sqlite.py
"""

from __future__ import annotations
import sqlite3
from pathlib import Path
from typing import Iterable, List, Optional, Tuple
import pandas as pd

CLEAN_CSV = Path("data/cleaned_irs_charities.csv")
DB_PATH = Path("data/charities.db")

def load_clean_csv(path: Path) -> pd.DataFrame:
    """Load the cleaned IRS CSV."""
    if not path.exists():
        raise FileNotFoundError(f"Cleaned CSV not found at {path}. Run step 1 first.")
    print(f"Loading cleaned CSV: {path}")
    df = pd.read_csv(path, dtype=str)
    print(f"Loaded {len(df):,} rows.")
    return df

def create_database(db_path: Path) -> sqlite3.Connection:
    """Create the SQLite database (deleting existing file)."""
    if db_path.exists():
        print(f"Removing existing database at {db_path}")
        db_path.unlink()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Creating new database at {db_path}")
    return sqlite3.connect(db_path)

def create_schema(conn: sqlite3.Connection) -> None:
    """Create the charities table and indexes."""
    schema = """
    CREATE TABLE charities (
        ein TEXT PRIMARY KEY,
        name TEXT,
        city TEXT,
        state TEXT,
        ntee_code TEXT,
        ntee_major TEXT
    );
    """
    indexes = [
        "CREATE INDEX idx_charities_state ON charities(state);",
        "CREATE INDEX idx_charities_ntee ON charities(ntee_code);",
        "CREATE INDEX idx_charities_major ON charities(ntee_major);",
        "CREATE INDEX idx_charities_major_state ON charities(ntee_major, state);",]
    conn.executescript(schema)
    for idx in indexes:
        conn.execute(idx)
    conn.commit()
    print("Database schema and indexes created.")

def prepare_rows(df: pd.DataFrame) -> List[Tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]]:
    """Clean and convert DataFrame rows to tuples ready for insertion."""
    df = df.copy()
    for col in ["ein", "name", "city", "state", "ntee_code", "ntee_major"]:
        if col not in df.columns:
            df[col] = pd.NA
    df["ein"] = df["ein"].astype(str).str.strip()
    df["state"] = df["state"].astype(str).str.strip().str.upper()
    df["ntee_major"] = df["ntee_major"].astype(str).str.strip().str.upper()
    df["ntee_code"] = df["ntee_code"].astype(str).str.strip().str.upper()
    df["name"] = df["name"].astype(str).str.strip()
    df["city"] = df["city"].astype(str).str.strip()
    df = df.drop_duplicates(subset=["ein"])
    def normalize(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = str(value).strip()
        return value if value else None
    rows = [
        (
            normalize(row.ein),
            normalize(row.name),
            normalize(row.city),
            normalize(row.state),
            normalize(row.ntee_code),
            normalize(row.ntee_major),)
        for row in df.itertuples(index=False)
        if normalize(row.ein)]
    return rows

def insert_rows(conn: sqlite3.Connection, rows: Iterable[Tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]]) -> None:
    """Insert prepared rows into the charities table using executemany."""
    conn.executemany(
        """
        INSERT OR IGNORE INTO charities (ein, name, city, state, ntee_code, ntee_major)
        VALUES (?, ?, ?, ?, ?, ?);
        """,
        rows,)
    conn.commit()

def main() -> None:
    df = load_clean_csv(CLEAN_CSV)
    conn = create_database(DB_PATH)
    try:
        create_schema(conn)
        rows = prepare_rows(df)
        insert_rows(conn, rows)

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM charities")
        total_rows = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(DISTINCT state) FROM charities")
        distinct_states = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(DISTINCT ntee_major) FROM charities")
        distinct_majors = cursor.fetchone()[0]

        print(f"Inserted rows: {total_rows:,}")
        print(f"Distinct states: {distinct_states}")
        print(f"Distinct NTEE majors: {distinct_majors}")
        print(f"SQLite database created at: {DB_PATH.resolve()}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
