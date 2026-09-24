import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app import load_transactions, pnl_for

def test_dataset_loaded():
    rows = load_transactions()
    assert len(rows) == 181
    assert rows[0]["id"] == "T1051"

def test_monthly_style_pnl_total():
    rows = load_transactions()
    pnl = pnl_for(rows)
    assert round(pnl["revenue"], 2) == 402551.45
    assert round(pnl["grossProfit"], 2) == 268060.15
    assert round(pnl["operatingProfit"], 2) == 39330.63
