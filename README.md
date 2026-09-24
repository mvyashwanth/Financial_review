# FINZ — AI-Native Financial Review

A complete internship-task implementation for reviewing a restaurant transaction ledger.

## What is included

- React + Vite financial review UI
- Flask REST API
- The supplied NYC Restaurant Co. transaction dataset (181 rows)
- Deterministic categorization rules
- Monthly P&L calculation
- Revenue, COGS, gross profit, payroll, operating expenses and operating profit
- Review queue for non-P&L, equity, balance-sheet and high-value transactions
- Transaction-level drill-down
- Evidence-backed analyst chat
- Automated backend tests

## Architecture

`CSV → deterministic categorization → financial calculation engine → REST API → React dashboard`

The analyst endpoint explains calculations from the ledger. It does not generate financial totals.

## Run

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

API: http://localhost:5000

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

### Tests

```bash
cd backend
pytest
```

## Dataset

The project uses:

`backend/data/transactions.csv`

Source columns:

- Transaction ID
- Date
- Description
- Counterparty
- Amount
- Method

The application parses currency strings and calculates all P&L figures from the source transaction rows.

## Important accounting treatment

The supplied descriptions are used to assign categories. Items such as loan principal repayment, owner distribution, equipment purchase and sales-tax remittance are kept outside operating P&L and surfaced for review.

This is a transaction-review application, not a replacement for an accountant's final books.

## API endpoints

- `GET /api/health`
- `GET /api/summary`
- `GET /api/transactions?month=2026-02&search=toast`
- `GET /api/pnl`
- `GET /api/reviews`
- `POST /api/chat` with `{ "question": "..." }`
