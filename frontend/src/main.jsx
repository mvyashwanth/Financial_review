import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {LayoutDashboard,ReceiptText,ChartNoAxesCombined,Flag,MessageSquare,Search,RefreshCw,ArrowUpRight,ArrowDownRight,X} from "lucide-react";
import "./styles.css";

const API="http://localhost:5000/api";
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n||0);
const pct=(n,d)=>d?((n/d)*100).toFixed(1)+"%":"—";

function App(){
 const [tab,setTab]=useState("dashboard"),[summary,setSummary]=useState(null),[tx,setTx]=useState([]),[reviews,setReviews]=useState([]),[pnl,setPnl]=useState([]),[search,setSearch]=useState(""),[month,setMonth]=useState("all"),[selected,setSelected]=useState(null),[question,setQuestion]=useState(""),[answer,setAnswer]=useState(null),[loading,setLoading]=useState(false);
 const load=async()=>{
  setLoading(true);
  const [s,t,r,p]=await Promise.all([fetch(API+"/summary"),fetch(API+"/transactions"),fetch(API+"/reviews"),fetch(API+"/pnl")]);
  setSummary(await s.json()); setTx((await t.json()).data); setReviews((await r.json()).data); setPnl((await p.json()).months); setLoading(false);
 };
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>tx.filter(x=>(month==="all"||x.month===month)&&(!search||`${x.id} ${x.description} ${x.counterparty} ${x.category}`.toLowerCase().includes(search.toLowerCase()))),[tx,month,search]);
 const ask=async(q=question)=>{if(!q.trim())return; setQuestion(q); const r=await fetch(API+"/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q})});setAnswer(await r.json())};
 if(!summary)return <div className="loading">Loading financial ledger…</div>;
 return <div className="app">
  <aside><div className="brand"><div className="logo">F</div><div><b>FINZ</b><span>Financial Review</span></div></div>
   <nav>{[["dashboard","Dashboard",LayoutDashboard],["transactions","Transactions",ReceiptText],["pnl","P&L Analysis",ChartNoAxesCombined],["reviews","Review Queue",Flag],["analyst","AI Analyst",MessageSquare]].map(([id,label,Icon])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}><Icon size={18}/>{label}{id==="reviews"&&<em>{reviews.length}</em>}</button>)}</nav>
   <div className="side-note"><small>DATASET</small><strong>NYC Restaurant Co.</strong><span>{summary.transactions} transactions · {summary.dateRange.from} → {summary.dateRange.to}</span></div>
  </aside>
  <main><header><div><small>FINANCIAL CONTROL CENTER</small><h1>{tab==="dashboard"?"Business overview":tab==="transactions"?"Transaction ledger":tab==="pnl"?"Profit & loss":tab==="reviews"?"Transactions requiring review":"Conversational financial analyst"}</h1></div><button className="refresh" onClick={load}><RefreshCw size={16}/>{loading?"Refreshing":"Refresh"}</button></header>
   {tab==="dashboard"&&<Dashboard summary={summary} pnl={pnl} setTab={setTab}/>}
   {tab==="transactions"&&<Transactions data={filtered} search={search} setSearch={setSearch} month={month} setMonth={setMonth} setSelected={setSelected}/>}
   {tab==="pnl"&&<PNL data={pnl} setSelected={setSelected} tx={tx}/>}
   {tab==="reviews"&&<Reviews data={reviews} setSelected={setSelected}/>}
   {tab==="analyst"&&<Analyst question={question} setQuestion={setQuestion} ask={ask} answer={answer}/>}
  </main>
  {selected&&<Drawer row={selected} close={()=>setSelected(null)}/>}
 </div>
}

function Dashboard({summary,pnl,setTab}){
 const p=summary.pnl, prev=pnl[pnl.length-2]?.operatingProfit;
 const cards=[["Revenue",p.revenue,"up"],["Gross profit",p.grossProfit,"up"],["Operating profit",p.operatingProfit,p.operatingProfit>=0?"up":"down"],["Review queue",summary.uncategorized,"flag"]];
 return <><section className="cards">{cards.map(([n,v,t])=><div className="card" key={n}><div className="cardtop"><span>{n}</span>{t==="up"?<ArrowUpRight size={16}/>:t==="down"?<ArrowDownRight size={16}/>:<Flag size={16}/>}</div><strong>{n==="Review queue"?v:money(v)}</strong><small>{n==="Operating profit"&&prev!=null?`Prior month ${money(prev)}`:n==="Review queue"?"Items needing attention":"Calculated from source transactions"}</small></div>)}</section>
 <section className="grid2"><div className="panel"><div className="panelhead"><div><h2>Monthly P&L</h2><p>Deterministic ledger calculation</p></div><button onClick={()=>setTab("pnl")}>Open analysis →</button></div><div className="bars">{pnl.map(m=><div className="barrow" key={m.month}><span>{m.month}</span><div className="bar"><i style={{width:`${Math.max(5,Math.min(100,(m.operatingProfit/20000)*100))}%`}}></i></div><b>{money(m.operatingProfit)}</b></div>)}</div></div>
 <div className="panel"><div className="panelhead"><div><h2>Control notes</h2><p>Designed around auditability</p></div></div><ul className="notes"><li>LLM explanations never calculate P&L totals.</li><li>Every financial answer can link back to source transactions.</li><li>Balance-sheet, equity and capex movements are separated from operating P&L.</li><li>Large and non-P&L transactions are surfaced for review.</li></ul></div></section>
 </>;
}

function Transactions({data,search,setSearch,month,setMonth,setSelected}){
 return <div className="panel"><div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search ID, description, counterparty…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={month} onChange={e=>setMonth(e.target.value)}><option value="all">All months</option><option>2026-01</option><option>2026-02</option><option>2026-03</option></select></div><Table data={data} setSelected={setSelected}/></div>
}
function Table({data,setSelected}){
 return <div className="tablewrap"><table><thead><tr><th>Date</th><th>Description</th><th>Counterparty</th><th>Category</th><th>Amount</th><th></th></tr></thead><tbody>{data.map(r=><tr key={r.id} onClick={()=>setSelected(r)}><td>{r.date}</td><td><b>{r.id}</b><br/><span>{r.description}</span></td><td>{r.counterparty}</td><td><label className={r.category.includes("Revenue")?"pill green":r.category.includes("COGS")?"pill amber":r.category.startsWith("Operating")?"pill blue":"pill gray"}>{r.category}</label></td><td className={r.amount>=0?"positive":"negative"}>{money(r.amount)}</td><td>›</td></tr>)}</tbody></table></div>
}
function PNL({data,setSelected,tx}){
 return <div className="panel"><div className="panelhead"><div><h2>Monthly P&L</h2><p>Revenue → COGS → gross profit → payroll → operating expenses → operating profit</p></div></div><table className="pnl"><thead><tr><th>Metric</th>{data.map(x=><th key={x.month}>{x.month}</th>)}</tr></thead><tbody>{[["Revenue","revenue"],["COGS","cogs"],["Gross Profit","grossProfit"],["Payroll","payroll"],["Operating Expenses","operatingExpenses"],["Operating Profit","operatingProfit"]].map(([n,k])=><tr className={k==="operatingProfit"?"total":""} key={k}><td>{n}</td>{data.map(x=><td key={x.month} className={x[k]>=0?"positive":"negative"}>{money(x[k])}</td>)}</tr>)}</tbody></table><div className="evidence"><h3>Evidence model</h3><p>Click a transaction in the Transactions or Review Queue views to inspect the source row used by the calculation. The financial engine uses the categorized transaction ledger, not generated text.</p></div></div>
}
function Reviews({data,setSelected}){
 return <div className="panel"><div className="reviewintro"><div><h2>{data.length} flagged transactions</h2><p>Review items are intentionally visible instead of being silently included in operating P&L.</p></div></div><div className="reviewgrid">{data.map(r=><article key={r.id} onClick={()=>setSelected(r)}><div className="rhead"><b>{r.id}</b><span>{r.date}</span></div><h3>{r.description}</h3><p>{r.counterparty}</p><div>{r.reviewReasons.map(x=><label className="reason" key={x}>{x}</label>)}</div><strong>{money(r.amount)}</strong></article>)}</div></div>
}
function Analyst({question,setQuestion,ask,answer}){
 const prompts=["What was operating profit by month?","Why did operating profit change?","Show revenue by month","Which transactions need review?"];
 return <div className="analyst"><div className="chatbox"><div className="chathero"><div className="aiicon">✦</div><h2>Ask the financial analyst</h2><p>Ask questions about the transaction ledger. Calculations remain deterministic and evidence is returned with the explanation.</p></div><div className="prompts">{prompts.map(p=><button key={p} onClick={()=>ask(p)}>{p}</button>)}</div>{answer&&<div className="answer"><div className="answerhead"><b>FINZ Analyst</b><span>Evidence-backed</span></div><pre>{answer.answer}</pre><small>{answer.note}</small></div>}<div className="askbar"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask a financial question…"/><button onClick={ask}><MessageSquare size={17}/> Ask</button></div></div></div>
}
function Drawer({row,close}){
 return <div className="overlay" onClick={close}><div className="drawer" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}><X/></button><small>SOURCE TRANSACTION</small><h2>{row.id}</h2><p className="drawerdesc">{row.description}</p><dl>{[["Date",row.date],["Counterparty",row.counterparty],["Method",row.method],["Category",row.category],["Amount",money(row.amount)]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className="trace"><b>Calculation trace</b><p>This source row is categorized by the deterministic rule engine. P&L totals are recomputed from the ledger at request time.</p></div></div></div>
}
createRoot(document.getElementById("root")).render(<App/>);
