from flask import Flask, jsonify, request
from flask_cors import CORS
import csv, os, re
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "transactions.csv")

RULES = [
    ("Revenue - Food Sales", ["pos batch deposit - food sales"]),
    ("Revenue - Beverage Sales", ["pos batch deposit - beverage sales"]),
    ("Revenue - Catering", ["catering invoice payment"]),
    ("Revenue - Delivery Marketplace", ["delivery marketplace payout"]),
    ("Deferred Revenue - Gift Cards", ["gift card sales deposit"]),
    ("Contra Revenue - Refunds & Discounts", ["refunds and discounts"]),
    ("COGS - Food", ["food inventory purchase", "large catering event food purchase"]),
    ("COGS - Beverage", ["beverage inventory purchase"]),
    ("Payroll", ["payroll -", "manager salary payroll"]),
    ("Payroll Taxes & Benefits", ["payroll taxes and benefits"]),
    ("Operating Expense - Rent", ["rent"]),
    ("Operating Expense - Software", ["pos/software"]),
    ("Operating Expense - Insurance", ["insurance"]),
    ("Operating Expense - Accounting", ["accounting/bookkeeping"]),
    ("Operating Expense - Packaging", ["to-go packaging"]),
    ("Operating Expense - Telecom", ["internet and phone"]),
    ("Operating Expense - Delivery Commissions", ["delivery platform commission"]),
    ("Operating Expense - Utilities", ["utilities"]),
    ("Operating Expense - Cleaning", ["cleaning and linen"]),
    ("Operating Expense - Marketing", ["marketing"]),
    ("Operating Expense - Repairs", ["repairs and maintenance"]),
    ("Operating Expense - Office", ["office/admin supplies"]),
    ("Operating Expense - Licenses", ["annual license renewal"]),
    ("Balance Sheet - Sales Tax", ["sales tax remittance"]),
    ("Balance Sheet - Loan Principal", ["loan principal repayment"]),
    ("Non-P&L - Equipment / Capex", ["equipment purchase"]),
    ("Equity - Owner Distribution", ["owner distribution"]),
]

REVENUE = {"Revenue - Food Sales","Revenue - Beverage Sales","Revenue - Catering",
           "Revenue - Delivery Marketplace","Contra Revenue - Refunds & Discounts"}
COGS = {"COGS - Food","COGS - Beverage"}
PAYROLL = {"Payroll","Payroll Taxes & Benefits"}
OPEX_PREFIX = "Operating Expense -"

def parse_amount(v):
    v = str(v).strip().replace("$","").replace(",","")
    return float(v) if v else 0.0

def categorize(description):
    text = description.lower()
    for category, phrases in RULES:
        if any(p in text for p in phrases):
            return category
    return "Review - Uncategorized"

def load_transactions():
    rows = []
    with open(DATA_PATH, newline="", encoding="utf-8-sig") as f:
        for raw in csv.DictReader(f):
            amount = parse_amount(raw["Amount"])
            dt = datetime.strptime(raw["Date"], "%Y-%m-%d")
            row = {
                "id": raw["Transaction ID"],
                "date": raw["Date"],
                "month": dt.strftime("%Y-%m"),
                "description": raw["Description"],
                "counterparty": raw["Counterparty"],
                "amount": round(amount, 2),
                "method": raw["Method"],
                "category": categorize(raw["Description"]),
            }
            rows.append(row)
    return rows

TX = load_transactions()

def pnl_for(rows):
    revenue = sum(r["amount"] for r in rows if r["category"] in REVENUE)
    cogs = sum(r["amount"] for r in rows if r["category"] in COGS)
    payroll = sum(r["amount"] for r in rows if r["category"] in PAYROLL)
    opex = sum(r["amount"] for r in rows if r["category"].startswith(OPEX_PREFIX))
    return {
        "revenue": round(revenue,2),
        "cogs": round(cogs,2),
        "grossProfit": round(revenue + cogs,2),
        "payroll": round(payroll,2),
        "operatingExpenses": round(opex,2),
        "operatingProfit": round(revenue + cogs + payroll + opex,2)
    }

def monthly_pnl():
    groups = defaultdict(list)
    for r in TX: groups[r["month"]].append(r)
    return [{"month": m, **pnl_for(groups[m])} for m in sorted(groups)]

def review_reasons(r):
    reasons = []
    c = r["category"]
    if c.startswith(("Balance Sheet","Non-P&L","Equity")):
        reasons.append("Excluded from operating P&L")
    if c == "Review - Uncategorized":
        reasons.append("No categorization rule matched")
    if abs(r["amount"]) >= 7000:
        reasons.append("High-value transaction")
    if "refund" in r["description"].lower():
        reasons.append("Contra-revenue item")
    return reasons

@app.get("/api/health")
def health():
    return jsonify({"status":"ok","transactions":len(TX)})

@app.get("/api/transactions")
def transactions():
    rows = TX
    month = request.args.get("month")
    category = request.args.get("category")
    search = request.args.get("search","").lower()
    if month: rows = [r for r in rows if r["month"] == month]
    if category: rows = [r for r in rows if r["category"] == category]
    if search:
        rows = [r for r in rows if search in " ".join([r["id"],r["description"],r["counterparty"],r["category"]]).lower()]
    return jsonify({"data":rows, "count":len(rows)})

@app.get("/api/pnl")
def pnl():
    return jsonify({"months":monthly_pnl(), "source":"Deterministic calculation from transactions.csv"})

@app.get("/api/reviews")
def reviews():
    data=[]
    for r in TX:
        reasons=review_reasons(r)
        if reasons:
            data.append({**r,"reviewReasons":reasons})
    return jsonify({"data":data,"count":len(data)})

@app.get("/api/summary")
def summary():
    months=monthly_pnl()
    total=pnl_for(TX)
    categories=defaultdict(float)
    for r in TX: categories[r["category"]] += r["amount"]
    return jsonify({
        "transactions":len(TX),
        "dateRange":{"from":min(r["date"] for r in TX),"to":max(r["date"] for r in TX)},
        "pnl":total,
        "months":months,
        "categoryTotals":{k:round(v,2) for k,v in sorted(categories.items())},
        "uncategorized":sum(r["category"]=="Review - Uncategorized" for r in TX)
    })

def analyst_answer(question):
    q=question.lower()
    months=monthly_pnl()
    if "operating profit" in q or "profit" in q:
        lines=["Operating profit is calculated deterministically as Revenue + COGS + Payroll + Operating Expenses."]
        for m in months:
            lines.append(f"{m['month']}: ${m['operatingProfit']:,.2f}")
        if "why" in q or "change" in q:
            for a,b in zip(months, months[1:]):
                delta=b["operatingProfit"]-a["operatingProfit"]
                lines.append(f"{a['month']} → {b['month']}: change ${delta:,.2f}; revenue change ${b['revenue']-a['revenue']:,.2f}, COGS change ${b['cogs']-a['cogs']:,.2f}, payroll change ${b['payroll']-a['payroll']:,.2f}, operating-expense change ${b['operatingExpenses']-a['operatingExpenses']:,.2f}.")
        return "\n".join(lines)
    if "revenue" in q:
        return "\n".join([f"{m['month']}: ${m['revenue']:,.2f}" for m in months])
    if "cogs" in q:
        return "\n".join([f"{m['month']}: ${m['cogs']:,.2f}" for m in months])
    if "review" in q or "flag" in q:
        rs=[r for r in TX if review_reasons(r)]
        return f"{len(rs)} transactions are flagged for review. Common reasons include balance-sheet/equity items, high-value transactions, and uncategorized items."
    return ("I can answer questions from the deterministic transaction ledger. Try: "
            "'What was operating profit by month?', 'Why did profit change?', "
            "'Show revenue by month', or 'Which transactions need review?'")

@app.post("/api/chat")
def chat():
    body=request.get_json(silent=True) or {}
    question=(body.get("question") or "").strip()
    if not question: return jsonify({"answer":"Please enter a financial question.","evidence":[]})
    answer=analyst_answer(question)
    evidence=[]
    q=question.lower()
    if "revenue" in q:
        evidence=[r for r in TX if r["category"] in REVENUE][:12]
    elif "cogs" in q:
        evidence=[r for r in TX if r["category"] in COGS][:12]
    elif "review" in q or "flag" in q:
        evidence=[r for r in TX if review_reasons(r)][:12]
    else:
        evidence=TX[:8]
    return jsonify({"answer":answer,"evidence":evidence,
                    "note":"Totals are calculated by the application; the analyst layer only explains the calculated ledger."})

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)
