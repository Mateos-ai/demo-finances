import { useState, useRef, useEffect } from 'react';
import {
  LuInbox, LuFileText, LuUpload, LuSearch, LuShield, LuDatabase,
  LuLightbulb, LuCheck, LuArrowLeft, LuLoader, LuFlag, LuCircleCheck,
  LuLayoutDashboard, LuPlug, LuTrendingUp, LuClock, LuActivity,
  LuArrowUpRight, LuZap, LuTriangleAlert, LuMail, LuPaperclip,
  LuFilePlus, LuCircleX, LuBadgeCheck,
  LuWand, LuSparkles, LuFlame, LuMegaphone, LuOrbit,
  LuBot, LuBrainCircuit, LuWrench, LuMessageSquare, LuX,
  LuCopy, LuPercent, LuList, LuRefreshCw, LuToggleRight, LuToggleLeft,
  LuShieldAlert, LuLink2, LuScanLine, LuPlus,
  LuPanelLeftClose, LuPanelLeftOpen,
} from 'react-icons/lu';

// ─── intake constants ─────────────────────────────────────────────────────────

const MOCK_FILE = { name: 'Invoice_GTS-2024-00891.pdf', size: '847 KB' };

const STEPS = [
  { log: '[AGENT] Initializing document layout analysis engine…',             done: 'Document parsed · 1 page · 847 tokens extracted.' },
  { log: '[AGENT] Extracting header fields, line items and VAT structure…',   done: 'Extracted 3 line items · subtotal €4,250.00 · VAT 21% detected.' },
  { log: '[AGENT] Cross-referencing vendor against Master Vendor Registry…',  done: 'Entity matched: Global Tech Solutions · BC vendor ID GTS-0042.' },
  { log: '[AGENT] Running GL pattern analysis against 24 months of postings…', done: 'Auto-allocated → 6200 · IT Consulting · confidence 98.7%.' },
];

const STEP_ACTIVE_AT   = [0, 1400, 2900, 4400];
const STEP_COMPLETE_AT = [1200, 2700, 4200, 5600];
const SHOW_REVIEW_AT   = 6300;

const RESULT = {
  invoiceNumber: 'GTS-2024-00891',
  invoiceDate:   '14 May 2024',
  dueDate:       '13 Jun 2024',
  vendor:        'Global Tech Solutions B.V.',
  vendorId:      'GTS-0042',
  poRef:         'PO-NL-2024-1142',
  lineItems: [
    { description: 'Cloud infrastructure consulting (Q2)', qty: 12, unit: 'hrs', unitPrice: 225.0, amount: 2700.0, gl: '6200' },
    { description: 'Security audit & compliance review',    qty: 4,  unit: 'hrs', unitPrice: 275.0, amount: 1100.0, gl: '6200' },
    { description: 'Software licence – Microsoft Azure Dev', qty: 1, unit: 'lic', unitPrice: 450.0, amount:  450.0, gl: '6210' },
  ],
  subtotal: 4250.0, vat: 892.5, total: 5142.5,
  glCode: '6200 – IT Consulting', confidence: '98.7%',
};

const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

// ─── dashboard data ───────────────────────────────────────────────────────────

const STATS = [
  { label: 'Automation rate',      value: '91%',    Icon: LuBadgeCheck,  delta: '+4% vs last month',    tip: 'invoices posted without human touch' },
  { label: 'Avg. processing time', value: '23 sec', Icon: LuZap,         delta: '↓ from 18 min manual',  tip: 'end-to-end, email to BC draft' },
  { label: 'Needs review',         value: '3',      Icon: LuTriangleAlert, delta: '2 flagged · 1 low-conf', tip: 'currently in your inbox' },
  { label: 'Hours saved',          value: '94 hrs', Icon: LuClock,       delta: 'this month',             tip: 'vs estimated manual processing time' },
];

const ACTIVITY = [
  { id: 'GTS-2024-00891', vendor: 'Global Tech Solutions B.V.',  amount: 5142.50,  status: 'posted',  date: 'Today' },
  { id: 'AWS-2024-00234', vendor: 'Amazon Web Services EMEA',    amount: 2890.00,  status: 'posted',  date: 'Yesterday' },
  { id: 'MSF-2024-01122', vendor: 'Microsoft Netherlands B.V.',  amount: 8400.00,  status: 'posted',  date: 'Jun 16' },
  { id: 'KPN-2024-00089', vendor: 'KPN B.V.',                    amount: 1250.00,  status: 'flagged', date: 'Jun 15' },
  { id: 'ORC-2024-00756', vendor: 'Oracle Corp.',                amount: 15200.00, status: 'posted',  date: 'Jun 14' },
];

// ─── inbox data ───────────────────────────────────────────────────────────────

const INBOX = [
  // unprocessed — show at top with "Process" button
  { id: null, from: 'invoices@hp.com',       vendor: 'HP Inc.',                    amount: 3200.00,  received: 'Just now',   status: 'new', confidence: null, note: '' },
  { id: null, from: 'finance@adobe.com',     vendor: 'Adobe Systems Inc.',         amount: 1890.00,  received: '12 min ago', status: 'new', confidence: null, note: '' },
  { id: null, from: 'billing@zoom.us',       vendor: 'Zoom Video Communications', amount: 450.00,   received: '31 min ago', status: 'new', confidence: null, note: '' },
  // needs review
  { id: 'GTS-2024-00891', from: 'ap@globaltechsolutions.com', vendor: 'Global Tech Solutions B.V.', amount: 5142.50,  received: '2 min ago',   status: 'review',  confidence: 98.7, note: 'Ready to post — review & confirm' },
  { id: 'KPN-2024-00089', from: 'noreply@kpn.com',           vendor: 'KPN B.V.',                   amount: 1250.00,  received: '1h 12m ago',  status: 'review',  confidence: 94.1, note: 'Possible duplicate of KPN-2024-00071' },
  { id: null,             from: 'billing@cloudservices.io',  vendor: null,                         amount: 22450.00, received: '3h 04m ago',  status: 'flagged', confidence: 38,   note: 'Vendor not found in BC registry' },
  // posted
  { id: 'AWS-2024-00892', from: 'invoices@aws.amazon.com',   vendor: 'Amazon Web Services EMEA',   amount: 2890.00,  received: '35 min ago',  status: 'posted',  confidence: 99.2, note: 'Posted to BC · GL 6210' },
  { id: 'MSF-2024-01123', from: 'no-reply@microsoft.com',    vendor: 'Microsoft Netherlands B.V.', amount: 8400.00,  received: '52 min ago',  status: 'posted',  confidence: 99.5, note: 'Posted to BC · GL 6200' },
  { id: 'MSF-2024-01122', from: 'invoices@microsoft.com',    vendor: 'Microsoft Netherlands B.V.', amount: 8400.00,  received: 'Jun 16',      status: 'posted',  confidence: 99.1, note: 'Posted to BC · GL 6200' },
  { id: 'ORC-2024-00756', from: 'ar@oracle.com',             vendor: 'Oracle Corp.',               amount: 15200.00, received: 'Jun 14',      status: 'posted',  confidence: 97.3, note: 'Posted to BC · GL 6210' },
  { id: 'AWS-2024-00234', from: 'invoices@aws.amazon.com',   vendor: 'Amazon Web Services EMEA',   amount: 2890.00,  received: 'Jun 13',      status: 'posted',  confidence: 99.8, note: 'Posted to BC · GL 6210' },
  { id: 'SAP-2024-00341', from: 'billing@sap.com',           vendor: 'SAP SE',                     amount: 4100.00,  received: 'Jun 12',      status: 'posted',  confidence: 98.0, note: 'Posted to BC · GL 6200' },
  { id: 'ZEN-2024-00112', from: 'ap@zendesk.com',            vendor: 'Zendesk Inc.',               amount: 890.00,   received: 'Jun 11',      status: 'posted',  confidence: 96.5, note: 'Posted to BC · GL 6310' },
];

// Data for the flagged / unknown-vendor invoice
const FLAGGED_RESULT = {
  invoiceNumber: 'CSI-2024-00445',
  invoiceDate:   '14 May 2024',
  dueDate:       '13 Jun 2024',
  vendor:        'Cloud Services International B.V.',
  vendorId:      'CSI-0091',
  poRef:         'PO-NL-2024-1198',
  lineItems: [
    { description: 'Cloud hosting infrastructure Q2', qty: 1, unit: 'mo', unitPrice: 12500.00, amount: 12500.00, gl: '6210' },
    { description: 'Managed security services',       qty: 1, unit: 'mo', unitPrice: 7500.00,  amount: 7500.00,  gl: '6200' },
    { description: 'Data backup & disaster recovery', qty: 1, unit: 'mo', unitPrice: 2450.00,  amount: 2450.00,  gl: '6210' },
  ],
  subtotal: 22450.00, vat: 4714.50, total: 27164.50,
  glCode: '6210 – Cloud & Infrastructure', confidence: '87.3%',
};

const SUGGESTED_VENDOR = {
  name:       'Cloud Services International B.V.',
  id:         'CSI-0091',
  match:      '84%',
  pastInvoices: 2,
  hint:       'Domain cloudservices.io matches this vendor\'s registered email domain.',
};

const MODAL_STEPS = [
  { text: 'Reading the document…',                          done: 'PDF parsed · 2 pages · 1,204 tokens extracted.' },
  { text: 'Getting the company information…',               done: 'Matched: Global Tech Solutions B.V. · BC vendor ID GTS-0042.' },
  { text: 'Looking up in Business Central…',                done: 'Vendor verified · 30-day payment terms · no outstanding blocks.' },
  { text: 'Preparing GL account suggestion…',               done: 'GL 6200 – IT Consulting suggested · confidence 98.7%.' },
];

// ─── integrations data ────────────────────────────────────────────────────────

const INTEGRATIONS = [
  // Microsoft — connected
  { name: 'Business Central', vendor: 'Microsoft',  cat: 'ERP',          status: 'connected', logo: '/integrations/business central.webp', abbr: 'BC' },
  { name: 'SharePoint',       vendor: 'Microsoft',  cat: 'Documents',    status: 'connected', logo: '/integrations/sharepoint.webp',         abbr: 'SP' },
  { name: 'Outlook',          vendor: 'Microsoft',  cat: 'Email',        status: 'connected', logo: '/integrations/outlook.webp',             abbr: 'OL' },
  // ERP
  { name: 'SAP S/4HANA',      vendor: 'SAP',        cat: 'ERP',          status: 'available', logo: '/integrations/sap.webp',                 abbr: 'SAP' },
  { name: 'NetSuite',         vendor: 'Oracle',     cat: 'ERP',          status: 'available', logo: '/integrations/NetSuite.webp',             abbr: 'NS' },
  { name: 'Workday',          vendor: 'Workday',    cat: 'Finance',      status: 'available', logo: '/integrations/workday.webp',              abbr: 'WD' },
  { name: 'Sage Intacct',     vendor: 'Sage',       cat: 'Accounting',   status: 'available', logo: '/integrations/sage.webp',                abbr: 'SG' },
  // Accounting
  { name: 'QuickBooks',       vendor: 'Intuit',     cat: 'Accounting',   status: 'available', logo: '/integrations/quickbook.webp',            abbr: 'QB' },
  { name: 'Xero',             vendor: 'Xero',       cat: 'Accounting',   status: 'available', logo: '/integrations/xero.webp',                 abbr: 'XE' },
  { name: 'FreshBooks',       vendor: 'FreshBooks', cat: 'Accounting',   status: 'soon',      logo: '/integrations/freshbooks.webp',           abbr: 'FB' },
  // Procurement
  { name: 'Coupa',            vendor: 'Coupa',      cat: 'Procurement',  status: 'available', logo: '/integrations/coupa.webp',                abbr: 'CP' },
  { name: 'SAP Ariba',        vendor: 'SAP',        cat: 'Procurement',  status: 'available', logo: '/integrations/ariba.webp',                abbr: 'AR' },
  { name: 'Concur',           vendor: 'SAP',        cat: 'Expenses',     status: 'available', logo: '/integrations/sap.webp',                  abbr: 'CC' },
  // Communication
  { name: 'Microsoft Teams',  vendor: 'Microsoft',  cat: 'Messaging',    status: 'available', logo: '/integrations/teams.webp',                abbr: 'MT' },
  { name: 'Slack',            vendor: 'Salesforce', cat: 'Messaging',    status: 'available', logo: '/integrations/Slack.webp',                abbr: 'SL' },
  // eSign & docs
  { name: 'Adobe Sign',       vendor: 'Adobe',      cat: 'eSign',        status: 'available', logo: '/integrations/adobe.webp',               abbr: 'AS' },
  // CRM & other
  { name: 'Salesforce',       vendor: 'Salesforce', cat: 'CRM',          status: 'available', logo: '/integrations/salesforce.webp',           abbr: 'SF' },
  { name: 'HubSpot',          vendor: 'HubSpot',    cat: 'CRM',          status: 'soon',      logo: '/integrations/hubspot.webp',              abbr: 'HS' },
  { name: 'Google Workspace', vendor: 'Google',     cat: 'Productivity', status: 'soon',      logo: '/integrations/google.webp',              abbr: 'GW' },
  { name: 'Dropbox',          vendor: 'Dropbox',    cat: 'Storage',      status: 'soon',      logo: '/integrations/dropbox.webp',              abbr: 'DB' },
];

// ─── agents data ─────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'invoice-classifier',
    name: 'Invoice Classifier',
    desc: 'Monitors ap@pwc.nl via Outlook, reads PDF attachments, extracts fields and routes invoices to the inbox queue.',
    status: 'running',
    Icon: LuInbox,
    color: '#FF8C42',
    lastRun: '2 min ago',
    nextRun: 'Continuous',
    stats: [{ label: 'Invoices processed', value: '847' }, { label: 'Auto-posted', value: '94%' }],
    tools: ['Read Invoice', 'Match Vendor', 'Post to GL', 'Flag for Review'],
  },
  {
    id: 'duplicate-detector',
    name: 'Duplicate Detector',
    desc: 'Cross-checks every new invoice against the last 90 days of posted transactions to catch duplicates before they post.',
    status: 'running',
    Icon: LuCopy,
    color: '#5B53E8',
    lastRun: '4 min ago',
    nextRun: 'Continuous',
    stats: [{ label: 'Checks this month', value: '912' }, { label: 'Duplicates caught', value: '7' }],
    tools: ['Check Duplicate', 'Query BC Ledger'],
  },
  {
    id: 'payment-monitor',
    name: 'Payment Due Monitor',
    desc: 'Scans posted invoices for upcoming due dates and delivers a daily payment run summary to your inbox each morning.',
    status: 'scheduled',
    Icon: LuClock,
    color: '#17BEBB',
    lastRun: 'Today 07:00',
    nextRun: 'Tomorrow 07:00',
    stats: [{ label: 'Due this week', value: '€84,200' }, { label: 'Overdue', value: '2' }],
    tools: ['Query BC Ledger', 'Send Outlook Email'],
  },
  {
    id: 'vendor-sync',
    name: 'Vendor Registry Sync',
    desc: 'Keeps the local vendor master in sync with Business Central every 30 minutes so matching is always current.',
    status: 'idle',
    Icon: LuRefreshCw,
    color: '#15B371',
    lastRun: '18 min ago',
    nextRun: 'In 12 min',
    stats: [{ label: 'Vendors tracked', value: '1,204' }, { label: 'Updated today', value: '3' }],
    tools: ['Query BC Ledger'],
  },
  {
    id: 'anomaly-flagging',
    name: 'Anomaly Flagging',
    desc: 'Flags invoices with amounts more than 2σ above a vendor\'s historical average and routes them for manual review.',
    status: 'running',
    Icon: LuShieldAlert,
    color: '#F5A524',
    lastRun: '11 min ago',
    nextRun: 'Continuous',
    stats: [{ label: 'Checked this month', value: '847' }, { label: 'Flagged', value: '4' }],
    tools: ['Query BC Ledger', 'Flag for Review'],
  },
];

const STATUS_META = {
  running:   { label: 'Running',   dot: '#15B371', text: '#15B371', bg: '#E6F8EF' },
  scheduled: { label: 'Scheduled', dot: '#F5A524', text: '#F5A524', bg: '#FFF4E0' },
  idle:      { label: 'Idle',      dot: '#A0A0B4', text: '#76768E', bg: '#F7F7FB' },
};

// ─── tools catalog ────────────────────────────────────────────────────────────

const TOOLS_CATALOG = [
  { name: 'Read Invoice',       cat: 'Read',   Icon: LuScanLine,    desc: 'Extracts header fields, line items and totals from PDF attachments via OCR.',             agents: ['Invoice Classifier'],                                    calls: 1204, latency: '1.2s' },
  { name: 'Match Vendor',       cat: 'Lookup', Icon: LuLink2,       desc: 'Resolves a vendor name or email against the Business Central master vendor registry.',    agents: ['Invoice Classifier'],                                    calls: 1204, latency: '0.3s' },
  { name: 'Post to GL',         cat: 'Write',  Icon: LuDatabase,    desc: 'Creates a draft posting entry in Business Central with the suggested GL account code.',   agents: ['Invoice Classifier'],                                    calls: 798,  latency: '0.8s' },
  { name: 'Check Duplicate',    cat: 'Lookup', Icon: LuCopy,        desc: 'Compares invoice amount, vendor and date against the last 90 days of BC transactions.',   agents: ['Duplicate Detector'],                                    calls: 912,  latency: '0.4s' },
  { name: 'Fetch VAT Rate',     cat: 'Lookup', Icon: LuPercent,     desc: 'Returns the applicable VAT rate for a vendor country and product category combination.',  agents: ['Invoice Classifier'],                                    calls: 1204, latency: '0.1s' },
  { name: 'Send Outlook Email', cat: 'Notify', Icon: LuMail,        desc: 'Composes and sends an email via the monitored Outlook account on behalf of the agent.',   agents: ['Payment Due Monitor'],                                   calls: 22,   latency: '0.6s' },
  { name: 'Query BC Ledger',    cat: 'Read',   Icon: LuSearch,      desc: 'Runs a filtered query against the Business Central general ledger and returns results.',   agents: ['Duplicate Detector','Payment Due Monitor','Vendor Registry Sync','Anomaly Flagging'], calls: 3847, latency: '0.5s' },
  { name: 'Flag for Review',    cat: 'Write',  Icon: LuFlag,        desc: 'Marks an invoice as needing human review and updates its inbox status to Needs Review.',  agents: ['Invoice Classifier', 'Anomaly Flagging'],                calls: 49,   latency: '0.1s' },
  { name: 'Extract Line Items', cat: 'Read',   Icon: LuList,        desc: 'Parses structured line items including descriptions, quantities and unit prices from text.',agents: ['Invoice Classifier'],                                   calls: 1204, latency: '0.9s' },
  { name: 'Parse PDF',          cat: 'Read',   Icon: LuFileText,    desc: 'Converts a PDF binary attachment to machine-readable text for downstream processing.',    agents: ['Invoice Classifier'],                                    calls: 1204, latency: '0.4s' },
];

const CAT_COLORS = {
  Read:   { text: '#1D4ED8', bg: '#EFF6FF' },
  Lookup: { text: '#5B53E8', bg: '#F4F3FD' },
  Write:  { text: '#B66535', bg: '#FFF7F2' },
  Notify: { text: '#15B371', bg: '#E6F8EF' },
};

// ─── copilot conversations ────────────────────────────────────────────────────

const CONVERSATIONS = [
  { id: 'current', title: 'Flagged invoices this month',      group: 'Today'     },
  { id: 'c2',      title: 'Q2 vendor payment summary',        group: 'Yesterday' },
  { id: 'c3',      title: 'SAP Ariba integration setup',      group: 'Yesterday' },
  { id: 'c4',      title: 'Overdue invoices from KPN',        group: 'Last week' },
  { id: 'c5',      title: 'GL account mapping review',        group: 'Last week' },
  { id: 'c6',      title: 'Invoice anomaly flagged',           group: 'Last week' },
  { id: 'c7',      title: 'Business Central sync issues',     group: 'Older'     },
  { id: 'c8',      title: 'Payment run June 13',              group: 'Older'     },
  { id: 'c9',      title: 'New vendor onboarding',            group: 'Older'     },
];

// ─── component ────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]                     = useState('inbox');
  const [inboxFilter, setInboxFilter]       = useState(null);
  const [intTab, setIntTab]                 = useState('available');
  const [agentToggles, setAgentToggles]     = useState(() => Object.fromEntries(AGENTS.map(a => [a.id, true])));
  const [toolsFilter, setToolsFilter]       = useState(null);
  const [modalStage, setModalStage]         = useState('closed');
  const [modalStep, setModalStep]           = useState(-1);
  const [modalDoneSteps, setModalDoneSteps] = useState([]);
  const [activeIdx, setActiveIdx]           = useState(null);
  const [modalOpenedAs, setModalOpenedAs]   = useState(null); // 'process' | 'review'
  const [inboxStatuses, setInboxStatuses]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('mateos-inbox') || '{}'); } catch { return {}; }
  });
  const modalTimers = useRef([]);

  const CHAT_WELCOME = [{ role: 'assistant', type: 'text', content: "Hi John! 👋 I'm your Financial Co-Pilot for Acme LTD.\n\nAsk me anything about your invoices, vendors, payments, or anything in your financial data." }];
  const [chatMessages, setChatMessages] = useState(CHAT_WELCOME);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const [activeConv, setActiveConv]     = useState('current');
  const [navOpen, setNavOpen]           = useState(true);
  const [modalPosting, setModalPosting]   = useState('idle'); // 'idle' | 'loading' | 'success'
  const [vendorApproved, setVendorApproved] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatLoading]);

  // Each entry is either a plain status string (legacy) or { status, vendor?, confidence? }
  const getStatus     = (inv, i) => { const s = inboxStatuses[i]; if (!s) return inv.status; return typeof s === 'string' ? s : s.status; };
  const getVendor     = (inv, i) => { const s = inboxStatuses[i]; return (s && typeof s === 'object' && s.vendor) ? s.vendor : inv.vendor; };
  const getConfidence = (inv, i) => { const s = inboxStatuses[i]; return (s && typeof s === 'object' && s.confidence != null) ? s.confidence : inv.confidence; };

  const saveStatus = (i, status, extra = {}) => {
    setInboxStatuses(prev => {
      const next = { ...prev, [i]: Object.keys(extra).length ? { status, ...extra } : status };
      try { localStorage.setItem('mateos-inbox', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const [stage, setStage]                   = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep]         = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clearAllTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const tick = (progress) => {
    const next = Math.min(progress + Math.random() * 12 + 6, 100);
    setUploadProgress(next);
    if (next < 100) {
      const t = setTimeout(() => tick(next), 80); timers.current.push(t);
    } else {
      const t = setTimeout(startProcessing, 500); timers.current.push(t);
    }
  };

  const handleTrigger = () => { clearAllTimers(); setStage('uploading'); setUploadProgress(0); tick(0); };

  const startProcessing = () => {
    setStage('processing'); setActiveStep(-1); setCompletedSteps([]);
    STEP_ACTIVE_AT.forEach((ms, i)   => { const t = setTimeout(() => setActiveStep(i), ms); timers.current.push(t); });
    STEP_COMPLETE_AT.forEach((ms, i) => { const t = setTimeout(() => setCompletedSteps(p => [...p, i]), ms); timers.current.push(t); });
    const t = setTimeout(() => setStage('review'), SHOW_REVIEW_AT); timers.current.push(t);
  };

  const reset = () => { clearAllTimers(); setStage('idle'); setUploadProgress(0); setActiveStep(-1); setCompletedSteps([]); };

  const handleSend = (text) => {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', type: 'text', content: msg }]);
    setChatLoading(true);
    const flagged = INBOX.filter((inv, i) => (inboxStatuses[i] ?? inv.status) === 'flagged');
    setTimeout(() => {
      setChatLoading(false);
      if (flagged.length === 0) {
        setChatMessages(prev => [...prev, { role: 'assistant', type: 'text', content: "Good news — there are no flagged invoices in your inbox right now. Everything looks clean! ✓" }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant', type: 'invoice-result',
          content: `Sure! I found ${flagged.length} flagged invoice${flagged.length !== 1 ? 's' : ''} in your inbox:`,
          invoices: flagged,
        }]);
      }
    }, 1900);
  };

  const clearModalTimers = () => { modalTimers.current.forEach(clearTimeout); modalTimers.current = []; };

  const closeModal = () => {
    clearModalTimers();
    if (modalOpenedAs === 'process' && activeIdx !== null) saveStatus(activeIdx, 'review');
    setModalPosting('idle');
    setVendorApproved(false);
    setModalStage('closed'); setModalStep(-1); setModalDoneSteps([]);
    setActiveIdx(null); setModalOpenedAs(null);
  };

  const handlePost = () => {
    if (modalPosting !== 'idle') return;
    setModalPosting('loading');
    const t1 = setTimeout(() => {
      if (activeIdx !== null) {
        const isUnknown = INBOX[activeIdx]?.vendor === null;
        const extra = (isUnknown && vendorApproved)
          ? { vendor: FLAGGED_RESULT.vendor, confidence: 100 }
          : {};
        saveStatus(activeIdx, 'posted', extra);
      }
      setModalPosting('success');
      const t2 = setTimeout(() => {
        setModalPosting('idle');
        clearModalTimers();
        setModalStage('closed'); setModalStep(-1); setModalDoneSteps([]);
        setActiveIdx(null); setModalOpenedAs(null);
      }, 900);
      modalTimers.current.push(t2);
    }, 1500);
    modalTimers.current.push(t1);
  };

  const openReview = (i) => { setActiveIdx(i); setModalOpenedAs('review'); setVendorApproved(false); setModalStage('review'); };

  const openProcess = (i) => {
    clearModalTimers();
    setActiveIdx(i); setModalOpenedAs('process');
    setModalStep(-1); setModalDoneSteps([]);
    setModalStage('processing');
    const ACTIVE_AT = [0, 1100, 2400, 3700];
    const DONE_AT   = [900, 2200, 3500, 4700];
    ACTIVE_AT.forEach((ms, idx) => { const t = setTimeout(() => setModalStep(idx), ms);   modalTimers.current.push(t); });
    DONE_AT.forEach((ms, idx)   => { const t = setTimeout(() => setModalDoneSteps(p => [...p, idx]), ms); modalTimers.current.push(t); });
    const t = setTimeout(() => setModalStage('review'), 5200);
    modalTimers.current.push(t);
  };

  const stepperItems = [
    { label: 'Upload', active: stage === 'idle' || stage === 'uploading' },
    { label: 'Review', active: stage === 'processing' || stage === 'review' },
    { label: 'Post',   active: stage === 'posted' },
  ];

  const inboxBadge = INBOX.filter((inv, i) => {
    const s = getStatus(inv, i);
    return s === 'review' || s === 'flagged' || s === 'new';
  }).length;

  const NAV_WORKSPACE = [
    { Icon: LuLayoutDashboard, label: 'Dashboard',   id: 'dashboard'    },
    { Icon: LuInbox,           label: 'Inbox',        id: 'inbox',       badge: inboxBadge || null },
    { Icon: LuPlug,            label: 'Integrations', id: 'integrations' },
  ];

  const NAV_INTELLIGENCE = [
    { Icon: LuBot,           label: 'Agents',   id: 'agents'   },
    { Icon: LuWrench,        label: 'Tools',    id: 'tools'    },
    { Icon: LuMessageSquare, label: 'Co-Pilot', id: 'copilot'  },
  ];

  const PAGE_META = {
    dashboard:    { title: 'Dashboard',    sub: 'AI processing metrics — what Business Central can\'t show you' },
    inbox:        { title: 'Inbox',        sub: 'Invoices received via Outlook · agent processing queue' },
    intake:       { title: 'New invoice',  sub: 'Manual upload for invoices that arrive outside email' },
    integrations: { title: 'Integrations', sub: 'Connect your financial systems and tools' },
    agents:       { title: 'Agents',       sub: 'Autonomous agents running in your financial workflows' },
    tools:        { title: 'Tools',        sub: 'Actions and capabilities available to your agents' },
    copilot:      { title: 'Co-Pilot',     sub: 'Chat with your financial data and workflows' },
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F7F7FB] text-[#14141E] font-sans overflow-hidden">

      {/* ── MAIN NAV SIDEBAR ───────────────────────────────────────────── */}
      <aside className={`${navOpen ? 'w-72' : 'w-[60px]'} bg-white border-r border-[#E0E0EA] flex flex-col shrink-0 overflow-hidden transition-all duration-200`}>
        {navOpen && <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between mb-10 mt-2">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/mateos-logo.svg" alt="Mateos.ai" className="w-8 h-8 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-[#14141E] leading-none whitespace-nowrap">
                  Mateos<span className="text-[#FF8C42]">.ai</span>
                </h1>
                <span className="text-[10px] tracking-widest text-[#A0A0B4] font-semibold uppercase block mt-0.5 whitespace-nowrap">
                  Financial Wizard
                </span>
              </div>
            </div>
            <button onClick={() => setNavOpen(false)} className="shrink-0 text-[#A0A0B4] hover:text-[#14141E] p-1.5 rounded-lg hover:bg-[#F7F7FB] transition-colors ml-1">
              <LuPanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Workspace */}
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#A0A0B4] block mb-3">Workspace</span>
            <nav className="space-y-1">
              {NAV_WORKSPACE.map(({ Icon, label, id, badge }) => {
                const active = page === id;
                return (
                  <button key={id} onClick={() => setPage(id)}
                    className={`w-full flex justify-between items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer text-left ${active ? 'bg-[#FFF7F2] text-[#14141E]' : 'text-[#55556B] hover:text-[#14141E] hover:bg-[#F7F7FB]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#B66535]' : ''}`} /> {label}
                    </div>
                    {badge && <span className="bg-[#FF8C42] text-[#14141E] text-xs px-2 py-0.5 rounded-full font-bold">{badge}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Intelligence */}
          <div className="mt-6">
            <span className="text-xs uppercase tracking-wider font-bold text-[#A0A0B4] block mb-3">Intelligence</span>
            <nav className="space-y-1">
              {NAV_INTELLIGENCE.map(({ Icon, label, id }) => {
                const active = page === id;
                return (
                  <button key={id} onClick={() => setPage(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer text-left ${active ? 'bg-[#FFF7F2] text-[#14141E]' : 'text-[#55556B] hover:text-[#14141E] hover:bg-[#F7F7FB]'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#B66535]' : ''}`} /> {label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Suite */}
          <div className="mt-6">
            <span className="text-xs uppercase tracking-wider font-bold text-[#A0A0B4] block mb-3">Suite</span>
            <nav className="space-y-1">
              <a
                href="https://mateos.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 text-[#55556B] hover:text-[#14141E] hover:bg-[#F7F7FB] px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <LuSparkles className="w-4 h-4 shrink-0 text-[#FF8C42]" /> Sales Magician
              </a>
              {[
                { Icon: LuFlame,     label: 'Operations Alchemist', color: '#17BEBB' },
                { Icon: LuMegaphone, label: 'Marketing Enchanter',  color: '#5B53E8' },
                { Icon: LuOrbit,     label: 'Customer Oracle',      color: '#15B371' },
              ].map(({ Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 text-[#55556B] hover:text-[#14141E] hover:bg-[#F7F7FB] px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer">
                  <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                  <span>{label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="space-y-5 pt-6 border-t border-[#E0E0EA]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#A0A0B4] block mb-3">Connected Systems</span>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Business Central', label: 'Connected', live: true },
                { name: 'Outlook',          label: 'Live',      live: true },
              ].map(({ name, label, live }) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-[#3C3C4F] font-medium">{name}</span>
                  <span className={`flex items-center gap-1.5 font-semibold ${live ? 'text-[#15B371]' : 'text-[#A0A0B4]'}`}>
                    {live && <span className="w-1.5 h-1.5 bg-[#15B371] rounded-full inline-block animate-pulse" />}
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#F7F7FB] border border-[#E0E0EA] p-3 rounded-xl">
            <div className="bg-[#FF8C42] text-[#14141E] font-bold w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0">JD</div>
            <div>
              <div className="text-sm font-semibold text-[#14141E]">John Doe</div>
              <div className="text-xs text-[#76768E]">Finance · Acme LTD.</div>
            </div>
          </div>
        </div>
        </div>}

        {/* ── COLLAPSED ICON STRIP ────────────────────────────────────── */}
        {!navOpen && (
          <div className="flex flex-col items-center justify-between py-4 flex-1">
            {/* Top: logo + all nav icons */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setNavOpen(true)} className="mb-4 hover:opacity-80 transition-opacity" title="Expand sidebar">
                <img src="/mateos-logo.svg" alt="Mateos.ai" className="w-8 h-8" />
              </button>

              {NAV_WORKSPACE.map(({ Icon, id, badge }) => {
                const active = page === id;
                return (
                  <button key={id} onClick={() => setPage(id)} title={id}
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#76768E] hover:bg-[#F7F7FB] hover:text-[#14141E]'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {badge && badge > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8C42] rounded-full" />}
                  </button>
                );
              })}

              <div className="w-7 h-px bg-[#E0E0EA] my-1" />

              {NAV_INTELLIGENCE.map(({ Icon, id }) => {
                const active = page === id;
                return (
                  <button key={id} onClick={() => setPage(id)} title={id}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#76768E] hover:bg-[#F7F7FB] hover:text-[#14141E]'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}

              <div className="w-7 h-px bg-[#E0E0EA] my-1" />

              <a href="https://mateos.ai" target="_blank" rel="noopener noreferrer" title="Sales Magician"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#76768E] hover:bg-[#F7F7FB] transition-colors"
              >
                <LuSparkles className="w-4 h-4 text-[#FF8C42]" />
              </a>
              {[
                { Icon: LuFlame,     color: '#17BEBB', label: 'Operations Alchemist' },
                { Icon: LuMegaphone, color: '#5B53E8', label: 'Marketing Enchanter'  },
                { Icon: LuOrbit,     color: '#15B371', label: 'Customer Oracle'       },
              ].map(({ Icon, color, label }) => (
                <div key={label} title={label} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#76768E] hover:bg-[#F7F7FB] transition-colors cursor-pointer">
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              ))}
            </div>

            {/* Bottom: user avatar — always visible */}
            <div className="bg-[#FF8C42] text-[#14141E] font-bold w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0">
              JD
            </div>
          </div>
        )}
      </aside>

      {/* ── CONVERSATIONS SIDEBAR (copilot only) ──────────────────────── */}
      {page === 'copilot' && (
        <aside className="w-56 bg-white border-r border-[#E0E0EA] flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EEEEF4] shrink-0">
            <span className="text-[11px] font-bold text-[#A0A0B4] uppercase tracking-wider whitespace-nowrap">Conversations</span>
            <button
              onClick={() => { setChatMessages(CHAT_WELCOME); setChatInput(''); setActiveConv(null); }}
              className="w-6 h-6 rounded-lg bg-[#FFF7F2] hover:bg-[#FFEDE1] text-[#B66535] flex items-center justify-center transition-colors"
              title="New conversation"
            >
              <LuPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {['Today', 'Yesterday', 'Last week', 'Older'].map(group => {
              const items = CONVERSATIONS.filter(c => c.group === group);
              if (!items.length) return null;
              return (
                <div key={group} className="mb-3">
                  <span className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider px-4 py-1 block whitespace-nowrap">{group}</span>
                  {items.map(conv => (
                    <button key={conv.id} onClick={() => setActiveConv(conv.id)}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors truncate block ${
                        activeConv === conv.id ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#55556B] hover:bg-[#F7F7FB] hover:text-[#14141E]'
                      }`}
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col ${page === 'copilot' ? 'overflow-hidden' : 'overflow-y-auto'}`}>

        {/* Header */}
        <header className="bg-white border-b border-[#E0E0EA] px-6 py-5 flex justify-between items-center shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-[#14141E] tracking-tight">{PAGE_META[page].title}</h2>
            <p className="text-xs text-[#76768E] font-medium mt-0.5">{PAGE_META[page].sub}</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {page === 'intake' && stepperItems.map(({ label, active }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${active ? 'bg-[#FF8C42] text-[#14141E]' : 'bg-[#EEEEF4] text-[#A0A0B4]'}`}>{i + 1}</span>
                  <span className={`font-semibold transition-colors duration-300 ${active ? 'text-[#14141E]' : 'text-[#A0A0B4]'}`}>{label}</span>
                </div>
                {i < stepperItems.length - 1 && <div className="w-8 h-px bg-[#E0E0EA]" />}
              </div>
            ))}
            <button
              onClick={() => {
                try { localStorage.removeItem('mateos-inbox'); } catch {}
                setInboxStatuses({});
                setPage('inbox');
                setInboxFilter(null);
                setChatMessages(CHAT_WELCOME);
                setChatInput('');
                setActiveConv('current');
                setVendorApproved(false);
                closeModal();
              }}
              className="bg-[#FFF7F2] hover:bg-[#FFEDE1] text-[#B66535] text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-lg ml-3 uppercase border border-[#FFD8BF] transition-colors cursor-pointer"
              title="Reset demo state"
            >Demo</button>
          </div>
        </header>

        <div className={`flex-1 min-h-0 ${page !== 'copilot' ? 'p-10 max-w-5xl w-full mx-auto' : 'flex'}`}>

          {/* ═══ DASHBOARD ═══════════════════════════════════════════════ */}
          {page === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">

              {/* Stats */}
              <div className="grid grid-cols-4 gap-5">
                {STATS.map(({ label, value, Icon, delta, tip }) => {
                  const liveValue = label === 'Needs review'
                    ? String(INBOX.filter((inv, i) => { const s = getStatus(inv, i); return s === 'review' || s === 'flagged' || s === 'new'; }).length)
                    : value;
                  return (
                  <div key={label} className="bg-white rounded-2xl border border-[#E0E0EA] shadow-[0_2px_6px_rgba(143,81,46,0.09)] p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#76768E] uppercase tracking-wider leading-tight">{label}</span>
                      <div className="w-8 h-8 bg-[#FFF7F2] rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#B66535]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#14141E] tracking-tight">{liveValue}</p>
                      <p className="text-xs text-[#A0A0B4] font-medium mt-0.5">{tip}</p>
                      <p className="text-xs text-[#15B371] font-semibold mt-0.5">{delta}</p>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-2xl border border-[#E0E0EA] shadow-[0_2px_6px_rgba(143,81,46,0.09)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#EEEEF4] flex justify-between items-center">
                  <span className="font-bold text-sm text-[#14141E] flex items-center gap-2">
                    <LuActivity className="w-4 h-4 text-[#B66535]" /> Recent activity
                  </span>
                  <button
                    onClick={() => setPage('intake')}
                    className="text-xs font-bold text-[#B66535] hover:underline flex items-center gap-1"
                  >
                    Process invoice <LuArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F7FB] border-b border-[#EEEEF4]">
                      {['Invoice', 'Vendor', 'Amount', 'Status', 'Date'].map((h) => (
                        <th key={h} className={`px-5 py-3 text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ACTIVITY.map((row, i) => (
                      <tr key={row.id} className={i < ACTIVITY.length - 1 ? 'border-b border-[#EEEEF4]' : ''}>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#3C3C4F]">{row.id}</td>
                        <td className="px-5 py-3.5 font-medium text-[#14141E]">{row.vendor}</td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-[#14141E]">{eur(row.amount)}</td>
                        <td className="px-5 py-3.5">
                          {row.status === 'posted' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15B371] bg-[#E6F8EF] px-2.5 py-0.5 rounded-full">
                              <LuCircleCheck className="w-3 h-3" /> Posted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5A524] bg-[#FFF4E0] px-2.5 py-0.5 rounded-full">
                              <LuTriangleAlert className="w-3 h-3" /> Flagged
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[#76768E] text-xs font-medium">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ INBOX ═══════════════════════════════════════════════════ */}
          {page === 'inbox' && (
            <div className="space-y-5 animate-fadeIn">

              {/* Source callout */}
              <div className="bg-[#F4F3FD] border border-[#E5E3FB] rounded-xl px-5 py-3.5 flex items-center gap-3">
                <LuMail className="w-4 h-4 text-[#5049CB] shrink-0" />
                <p className="text-xs text-[#373287] font-medium">
                  Monitoring <span className="font-bold">ap@pwc.nl</span> via Outlook — invoices with PDF attachments are picked up automatically and processed by the agent.
                </p>
              </div>

              {/* Filter tabs */}
              {(() => {
                const tabs = [
                  { label: 'All',          filter: null },
                  { label: 'Needs review', filter: 'review', count: INBOX.filter((inv, i) => { const s = getStatus(inv, i); return s === 'review' || s === 'flagged'; }).length },
                  { label: 'Posted',       filter: 'posted' },
                ];
                return (
                  <div className="flex gap-1 bg-white border border-[#E0E0EA] rounded-xl p-1 w-fit">
                    {tabs.map(({ label, filter, count }) => {
                      const active = inboxFilter === filter;
                      return (
                        <button
                          key={label}
                          onClick={() => setInboxFilter(filter)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                            active ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#76768E] hover:text-[#14141E]'
                          }`}
                        >
                          {label}
                          {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-[#FFD8BF] text-[#B66535]' : 'bg-[#EEEEF4] text-[#76768E]'}`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Invoice list */}
              <div className="bg-white border border-[#E0E0EA] rounded-2xl shadow-[0_2px_6px_rgba(143,81,46,0.09)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F7FB] border-b border-[#E0E0EA]">
                      {['From', 'Vendor', 'Amount', 'Confidence', 'Status', 'Received', ''].map((h) => (
                        <th key={h} className={`px-5 py-3 text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider ${h === 'Amount' || h === 'Confidence' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INBOX
                      .filter((inv, i) => {
                        const s = getStatus(inv, i);
                        if (!inboxFilter) return true;
                        if (inboxFilter === 'review') return s === 'review' || s === 'flagged';
                        if (inboxFilter === 'posted') return s === 'posted';
                        return true;
                      })
                      .map((inv, _rowIdx, arr) => {
                        const i = INBOX.indexOf(inv);
                        const s = getStatus(inv, i);
                        return (
                        <tr key={i} className={`${_rowIdx < arr.length - 1 ? 'border-b border-[#EEEEF4]' : ''} ${s === 'review' || s === 'flagged' || s === 'new' ? 'bg-[#FFFCFB]' : ''}`}>
                          {/* From */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <LuMail className="w-3.5 h-3.5 text-[#A0A0B4] shrink-0" />
                              <span className="text-xs text-[#55556B] font-medium truncate max-w-[140px]">{inv.from}</span>
                            </div>
                          </td>
                          {/* Vendor */}
                          <td className="px-5 py-3.5">
                            {getVendor(inv, i)
                              ? <span className="font-medium text-[#14141E] text-sm">{getVendor(inv, i)}</span>
                              : <span className="text-xs text-[#E5484D] font-semibold bg-[#FCE9EA] px-2 py-0.5 rounded-full">Unknown vendor</span>
                            }
                          </td>
                          {/* Amount */}
                          <td className="px-5 py-3.5 text-right">
                            {inv.amount
                              ? <span className="font-semibold tabular-nums text-[#14141E]">{eur(inv.amount)}</span>
                              : <span className="text-[#A0A0B4] text-xs">—</span>
                            }
                          </td>
                          {/* Confidence */}
                          <td className="px-5 py-3.5 text-right">
                            {getConfidence(inv, i) !== null
                              ? <span className={`text-xs font-bold tabular-nums ${getConfidence(inv, i) >= 90 ? 'text-[#15B371]' : getConfidence(inv, i) >= 60 ? 'text-[#F5A524]' : 'text-[#E5484D]'}`}>{getConfidence(inv, i)}%</span>
                              : <span className="text-[#A0A0B4] text-xs">—</span>
                            }
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {s === 'new' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#76768E] bg-[#F7F7FB] border border-[#E0E0EA] px-2.5 py-0.5 rounded-full">
                                <LuMail className="w-3 h-3" /> New
                              </span>
                            )}
                            {s === 'review' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5049CB] bg-[#F4F3FD] px-2.5 py-0.5 rounded-full">
                                <LuCircleCheck className="w-3 h-3" /> Needs review
                              </span>
                            )}
                            {s === 'flagged' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5A524] bg-[#FFF4E0] px-2.5 py-0.5 rounded-full">
                                <LuTriangleAlert className="w-3 h-3" /> Flagged
                              </span>
                            )}
                            {s === 'posted' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15B371] bg-[#E6F8EF] px-2.5 py-0.5 rounded-full">
                                <LuCircleCheck className="w-3 h-3" /> Posted
                              </span>
                            )}
                          </td>
                          {/* Received */}
                          <td className="px-5 py-3.5 text-xs text-[#A0A0B4] font-medium whitespace-nowrap">{inv.received}</td>
                          {/* Action */}
                          <td className="px-5 py-3.5">
                            {s === 'new' && (
                              <button
                                onClick={() => openProcess(i)}
                                className="text-xs font-bold text-[#14141E] bg-[#FF8C42] hover:bg-[#DD7A3C] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Process
                              </button>
                            )}
                            {(s === 'review' || s === 'flagged') && (
                              <button
                                onClick={() => openReview(i)}
                                className="text-xs font-bold text-[#5049CB] bg-[#F4F3FD] hover:bg-[#E5E3FB] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Review →
                              </button>
                            )}
                            {s === 'posted' && (
                              <span className="text-xs text-[#A0A0B4] font-medium">{inv.note || 'Posted to BC'}</span>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ INTAKE ══════════════════════════════════════════════════ */}
          {page === 'intake' && (
            <div>

              {stage === 'idle' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-extrabold text-[#14141E] tracking-tight">Drop an invoice to start</h3>
                    <p className="text-[#55556B] max-w-2xl leading-relaxed text-sm font-medium">
                      Upload a supplier or client invoice for <span className="font-bold text-[#14141E]">PwC Internal</span>. Financial Wizard reads it, matches the vendor against your master data, and prepares it for posting.
                    </p>
                  </div>

                  <div
                    className="bg-white border-2 border-dashed border-[#E0E0EA] hover:border-[#FF8C42] hover:bg-[#FFF7F2]/30 rounded-2xl p-14 text-center flex flex-col items-center gap-6 transition-all duration-200 cursor-pointer group"
                    onClick={handleTrigger}
                  >
                    <div className="w-14 h-14 bg-[#FFF7F2] group-hover:bg-[#FFEDE1] text-[#B66535] rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-200">
                      <LuUpload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#14141E]">Drop your invoice here</h4>
                      <p className="text-[#A0A0B4] text-xs mt-1 font-medium">or browse — PDF, PNG or JPG up to 20 MB</p>
                    </div>
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={handleTrigger} className="bg-[#FF8C42] hover:bg-[#DD7A3C] text-[#14141E] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2">
                        <LuUpload className="w-4 h-4" /> Browse files
                      </button>
                      <button onClick={handleTrigger} className="bg-white hover:bg-[#F7F7FB] text-[#3C3C4F] border border-[#E0E0EA] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all">
                        Use a sample invoice
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { Icon: LuSearch,   title: 'Reads any layout',   desc: 'Header fields, line items, VAT and totals — no template setup required.' },
                      { Icon: LuShield,   title: 'Matches the vendor',  desc: 'Resolves the counterparty automatically against a Business Central account.' },
                      { Icon: LuDatabase, title: 'Posts in one click',  desc: 'Creates the data entry draft in Business Central with GL code mappings applied.' },
                    ].map(({ Icon, title, desc }) => (
                      <div key={title} className="bg-white p-5 rounded-xl border border-[#E0E0EA] shadow-[0_2px_6px_rgba(143,81,46,0.09)] space-y-2">
                        <Icon className="w-5 h-5 text-[#B66535]" />
                        <h5 className="font-bold text-[#14141E] text-sm">{title}</h5>
                        <p className="text-[#76768E] text-xs leading-relaxed font-medium">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stage === 'uploading' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#14141E] tracking-tight">Uploading invoice…</h3>
                    <p className="text-sm text-[#76768E] font-medium">Your file is being securely transferred.</p>
                  </div>
                  <div className="bg-white border border-[#E0E0EA] rounded-2xl p-8 shadow-[0_2px_6px_rgba(143,81,46,0.09)] max-w-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-14 bg-[#FCE9EA] border border-[#FCE9EA] rounded-lg flex flex-col items-center justify-center shrink-0">
                        <LuFileText className="w-5 h-5 text-[#E5484D]" />
                        <span className="text-[8px] font-bold text-[#E5484D] mt-1 uppercase tracking-wide">PDF</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-bold text-[#14141E]">{MOCK_FILE.name}</p>
                          <p className="text-xs text-[#A0A0B4] font-medium">{MOCK_FILE.size}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-[#EEEEF4] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF8C42] rounded-full transition-all duration-75 ease-out" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-[#76768E] font-medium tabular-nums">
                            {uploadProgress < 100 ? `${Math.round(uploadProgress)}% uploaded` : 'Upload complete — starting analysis…'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 'processing' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[#14141E] tracking-tight">Agent processing…</h3>
                    <p className="text-sm text-[#76768E] font-medium">Financial Wizard is analysing your document.</p>
                  </div>
                  <div className="bg-[#14141E] text-[#C9C9D6] p-7 rounded-2xl font-mono text-sm shadow-[0_6px_16px_rgba(143,81,46,0.11)] border border-[#262635] space-y-5 leading-relaxed min-h-[260px]">
                    {STEPS.map((step, i) => {
                      if (activeStep < i) return null;
                      const done = completedSteps.includes(i);
                      return (
                        <div key={i} className="space-y-1.5 animate-fadeIn">
                          <div className="flex items-start gap-2.5 text-[#FFA56C]">
                            <span className="mt-0.5 shrink-0">
                              {done ? <LuCircleCheck className="w-4 h-4 text-green-400" /> : <LuLoader className="w-4 h-4 animate-spin" />}
                            </span>
                            <span>{step.log}</span>
                          </div>
                          {done
                            ? <div className="text-[#A5A0F2]/90 ml-7 animate-fadeInFast">✓ {step.done}</div>
                            : <div className="text-[#55556B] ml-7 animate-pulse">Processing…</div>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stage === 'review' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-[#14141E] tracking-tight">Review extracted data</h3>
                      <p className="text-xs text-[#76768E] font-medium mt-0.5">Verify all fields before posting to Business Central.</p>
                    </div>
                    <button onClick={reset} className="text-sm font-bold text-[#B66535] hover:underline flex items-center gap-1.5">
                      <LuArrowLeft className="w-4 h-4" /> Upload a different file
                    </button>
                  </div>

                  <div className="bg-[#F4F3FD] border border-[#E5E3FB] rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <LuDatabase className="w-5 h-5 text-[#5049CB] mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold text-[#2A2666]">Target Environment: PwC Internal</h5>
                      <p className="text-xs text-[#373287]/80 mt-1 font-medium leading-relaxed">
                        Data has been mapped to the Chart of Accounts for <span className="font-bold">PwC Internal</span>. Approving will route the transaction to their isolated database instance.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 items-start">
                    <div className="col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0EA] shadow-[0_2px_6px_rgba(143,81,46,0.09)] space-y-5">
                      <div className="border-b border-[#EEEEF4] pb-3 flex justify-between items-center">
                        <span className="font-bold text-sm text-[#14141E]">Ledger Entry Field Mappings</span>
                        <span className="text-xs text-[#15B371] bg-[#E6F8EF] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                          <LuCircleCheck className="w-3 h-3" /> Confidence {RESULT.confidence}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Invoice Number', value: RESULT.invoiceNumber },
                          { label: 'Invoice Date',   value: RESULT.invoiceDate   },
                          { label: 'Due Date',       value: RESULT.dueDate       },
                          { label: 'Vendor',         value: RESULT.vendor, span: true },
                          { label: 'Vendor ID',      value: RESULT.vendorId      },
                          { label: 'PO Reference',   value: RESULT.poRef         },
                        ].map(({ label, value, span }) => (
                          <div key={label} className={`space-y-1 ${span ? 'col-span-2' : ''}`}>
                            <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block">{label}</label>
                            <input readOnly value={value} className="w-full bg-[#F7F7FB] border border-[#E0E0EA] rounded-lg px-3 py-2 font-medium text-sm text-[#14141E] focus:outline-none" />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block">Line Items</label>
                        <div className="border border-[#E0E0EA] rounded-xl overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-[#F7F7FB] border-b border-[#E0E0EA]">
                                {['Description', 'Qty', 'Unit', 'Unit price', 'Amount', 'GL'].map((h) => (
                                  <th key={h} className={`px-3 py-2.5 font-bold text-[#A0A0B4] uppercase tracking-wider text-[10px] ${h === 'Description' ? 'text-left' : h === 'GL' ? 'text-center' : 'text-right'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {RESULT.lineItems.map((item, i) => (
                                <tr key={i} className={i < RESULT.lineItems.length - 1 ? 'border-b border-[#EEEEF4]' : ''}>
                                  <td className="px-3 py-2.5 text-[#3C3C4F] font-medium">{item.description}</td>
                                  <td className="px-3 py-2.5 text-[#55556B] text-right tabular-nums">{item.qty}</td>
                                  <td className="px-3 py-2.5 text-[#A0A0B4]">{item.unit}</td>
                                  <td className="px-3 py-2.5 text-[#55556B] text-right tabular-nums">{eur(item.unitPrice)}</td>
                                  <td className="px-3 py-2.5 text-[#14141E] font-semibold text-right tabular-nums">{eur(item.amount)}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="text-[10px] font-mono bg-[#FFF7F2] text-[#B66535] border border-[#FFEDE1] px-1.5 py-0.5 rounded font-bold">{item.gl}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="space-y-1.5 w-60">
                          <div className="flex justify-between text-sm text-[#76768E]"><span>Subtotal</span><span className="tabular-nums font-medium">{eur(RESULT.subtotal)}</span></div>
                          <div className="flex justify-between text-sm text-[#76768E]"><span>VAT 21%</span><span className="tabular-nums font-medium">{eur(RESULT.vat)}</span></div>
                          <div className="flex justify-between text-sm font-bold text-[#14141E] border-t border-[#E0E0EA] pt-2 mt-1"><span>Total</span><span className="tabular-nums">{eur(RESULT.total)}</span></div>
                        </div>
                      </div>

                      <div className="bg-[#FFF7F2] border border-[#FFEDE1] rounded-xl p-3 space-y-1">
                        <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block">Suggested GL Account</label>
                        <div className="flex items-center gap-2">
                          <input readOnly value={RESULT.glCode} className="flex-1 bg-transparent border-0 text-[#683C27] font-mono font-semibold text-sm focus:outline-none" />
                          <span className="text-[10px] bg-[#E6F8EF] text-[#15B371] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Auto-matched</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EEEEF4] flex gap-3">
                        <button onClick={() => setStage('posted')} className="flex-1 bg-[#FF8C42] hover:bg-[#DD7A3C] text-[#14141E] font-bold text-sm py-2.5 rounded-xl shadow-[0_2px_6px_rgba(143,81,46,0.18)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                          <LuCheck className="w-4 h-4" /> Post to Business Central
                        </button>
                        <button onClick={reset} className="bg-[#EEEEF4] hover:bg-[#E0E0EA] text-[#3C3C4F] font-bold text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                          <LuFlag className="w-4 h-4" /> Flag Issue
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#14141E] text-[#C9C9D6] p-5 rounded-2xl shadow-[0_6px_16px_rgba(143,81,46,0.11)] flex flex-col justify-between min-h-[500px]">
                      <div className="space-y-4">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#262635] pb-2.5 flex items-center gap-2">
                          <LuLightbulb className="w-3.5 h-3.5 text-[#FFA56C]" /> Agent Reasoning Trail
                        </h4>
                        <p className="text-xs text-[#A0A0B4] leading-relaxed font-medium">Matched <span className="text-white font-semibold">"{RESULT.vendor}"</span> using PwC Internal master identifier key validation indexes against BC vendor registry.</p>
                        <p className="text-xs text-[#A0A0B4] leading-relaxed font-medium">3 line items extracted. Pattern analysis matches historical IT consulting postings. Auto-allocating to <span className="text-[#FFC097] font-mono">{RESULT.glCode}</span>.</p>
                        <p className="text-xs text-[#A0A0B4] leading-relaxed font-medium">Due date <span className="text-white font-semibold">{RESULT.dueDate}</span> within standard 30-day net terms. No anomalies detected.</p>
                        <div className="space-y-1.5 pt-1">
                          {[{ label: 'Vendor match', score: '99%' }, { label: 'GL allocation', score: '98.7%' }, { label: 'VAT validation', score: '100%' }].map(({ label, score }) => (
                            <div key={label} className="flex justify-between items-center text-xs">
                              <span className="text-[#55556B]">{label}</span>
                              <span className="text-green-400 font-bold font-mono">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#0D0D15] p-3 rounded-xl border border-[#262635] text-[10px] text-[#55556B] font-mono mt-6">
                        Audit record: ID_MATEOS_99182_CY
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stage === 'posted' && (
                <div className="animate-fadeIn flex flex-col items-center justify-center py-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-[#E6F8EF] rounded-full flex items-center justify-center">
                    <LuCircleCheck className="w-10 h-10 text-[#15B371]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#14141E]">Posted to Business Central</h3>
                    <p className="text-sm text-[#76768E] font-medium mt-2">Invoice {RESULT.invoiceNumber} has been posted successfully to PwC Internal.</p>
                  </div>
                  <button onClick={reset} className="bg-[#FF8C42] hover:bg-[#DD7A3C] text-[#14141E] font-bold px-6 py-3 rounded-xl shadow-[0_2px_6px_rgba(143,81,46,0.18)] transition-all">
                    Process another invoice
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ═══ AGENTS ══════════════════════════════════════════════════ */}
          {page === 'agents' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary bar */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { label: 'Total agents', value: AGENTS.length },
                  { label: 'Running',   value: AGENTS.filter(a => a.status === 'running').length,   color: '#15B371' },
                  { label: 'Scheduled', value: AGENTS.filter(a => a.status === 'scheduled').length, color: '#F5A524' },
                  { label: 'Idle',      value: AGENTS.filter(a => a.status === 'idle').length,      color: '#A0A0B4' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border border-[#E0E0EA] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-[0_1px_2px_rgba(143,81,46,0.06)]">
                    {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
                    <span className="text-xs text-[#76768E] font-medium">{label}</span>
                    <span className="text-sm font-bold text-[#14141E]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Agent cards */}
              <div className="grid grid-cols-2 gap-5">
                {AGENTS.map((agent) => {
                  const sm = STATUS_META[agent.status];
                  const on = agentToggles[agent.id];
                  return (
                    <div key={agent.id} className={`bg-white border rounded-2xl p-5 shadow-[0_2px_6px_rgba(143,81,46,0.09)] flex flex-col gap-4 transition-opacity ${on ? 'border-[#E0E0EA]' : 'border-[#E0E0EA] opacity-50'}`}>
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: on ? `${agent.color}18` : '#F7F7FB' }}>
                            <agent.Icon className="w-4 h-4" style={{ color: on ? agent.color : '#A0A0B4' }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#14141E]">{agent.name}</p>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5" style={{ background: sm.bg, color: sm.text }}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sm.dot }} />
                              {sm.label}
                            </span>
                          </div>
                        </div>
                        {/* Toggle */}
                        <button
                          onClick={() => setAgentToggles(prev => ({ ...prev, [agent.id]: !prev[agent.id] }))}
                          className="shrink-0 mt-0.5"
                        >
                          {on
                            ? <LuToggleRight className="w-8 h-8" style={{ color: agent.color }} />
                            : <LuToggleLeft  className="w-8 h-8 text-[#C9C9D6]" />
                          }
                        </button>
                      </div>

                      <p className="text-xs text-[#76768E] leading-relaxed">{agent.desc}</p>

                      {/* Stats row */}
                      <div className="flex gap-4">
                        {agent.stats.map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-base font-extrabold text-[#14141E] tracking-tight">{value}</p>
                            <p className="text-[10px] text-[#A0A0B4] font-medium">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-[#EEEEF4] pt-3 flex items-center justify-between gap-3">
                        <div className="text-[10px] text-[#A0A0B4] font-medium space-y-0.5">
                          <div>Last run: <span className="text-[#55556B] font-semibold">{agent.lastRun}</span></div>
                          <div>Next run: <span className="text-[#55556B] font-semibold">{agent.nextRun}</span></div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {agent.tools.map(t => (
                            <span key={t} className="text-[10px] font-medium text-[#76768E] bg-[#F7F7FB] border border-[#E0E0EA] px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ TOOLS ═══════════════════════════════════════════════════ */}
          {page === 'tools' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Category filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1 bg-white border border-[#E0E0EA] rounded-xl p-1">
                  {[null, 'Read', 'Lookup', 'Write', 'Notify'].map((cat) => (
                    <button
                      key={cat ?? 'all'}
                      onClick={() => setToolsFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        toolsFilter === cat ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#76768E] hover:text-[#14141E]'
                      }`}
                    >
                      {cat ?? 'All'}
                      {cat && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#EEEEF4] text-[#76768E]">
                          {TOOLS_CATALOG.filter(t => t.cat === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#A0A0B4] font-medium ml-1">{TOOLS_CATALOG.filter(t => !toolsFilter || t.cat === toolsFilter).length} tools</span>
              </div>

              {/* Tools grid */}
              <div className="grid grid-cols-3 gap-4">
                {TOOLS_CATALOG.filter(t => !toolsFilter || t.cat === toolsFilter).map((tool) => {
                  const cc = CAT_COLORS[tool.cat];
                  return (
                    <div key={tool.name} className="bg-white border border-[#E0E0EA] rounded-2xl p-4 shadow-[0_1px_2px_rgba(143,81,46,0.06)] flex flex-col gap-3 hover:border-[#C9C9D6] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cc.bg }}>
                          <tool.Icon className="w-4 h-4" style={{ color: cc.text }} />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1" style={{ background: cc.bg, color: cc.text }}>{tool.cat}</span>
                      </div>

                      <div>
                        <p className="font-bold text-sm text-[#14141E]">{tool.name}</p>
                        <p className="text-xs text-[#76768E] mt-1 leading-relaxed">{tool.desc}</p>
                      </div>

                      {/* Agents */}
                      <div className="flex gap-1.5 flex-wrap">
                        {tool.agents.map(a => (
                          <span key={a} className="text-[10px] font-medium text-[#5049CB] bg-[#F4F3FD] px-2 py-0.5 rounded-full truncate max-w-[140px]">{a}</span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="border-t border-[#EEEEF4] pt-2.5 flex justify-between text-xs">
                        <span className="text-[#A0A0B4] font-medium">
                          <span className="text-[#14141E] font-bold">{tool.calls.toLocaleString()}</span> calls / mo
                        </span>
                        <span className="text-[#A0A0B4] font-medium">
                          avg <span className="text-[#14141E] font-bold">{tool.latency}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ CO-PILOT ════════════════════════════════════════════════ */}
          {page === 'copilot' && (
            <div className="animate-fadeIn flex-1 flex flex-col bg-white min-h-0">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-6 space-y-5 pb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>

                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-white border border-[#FFD8BF] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <img src="/mateos-logo.svg" alt="Co-Pilot" className="w-4 h-4" />
                      </div>
                    )}

                    {msg.role === 'user' && (
                      <div className="max-w-[72%] bg-[#FF8C42] text-[#14141E] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                        <p className="text-sm font-medium whitespace-pre-line">{msg.content}</p>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.type === 'text' && (
                      <div className="max-w-[72%] bg-white border border-[#E0E0EA] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm animate-fadeIn">
                        <p className="text-sm text-[#14141E] leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.type === 'invoice-result' && (
                      <div className="max-w-[80%] bg-white border border-[#E0E0EA] rounded-2xl rounded-tl-sm shadow-sm overflow-hidden animate-fadeIn">
                        <div className="px-4 py-3 border-b border-[#EEEEF4] bg-[#F7F7FB]">
                          <p className="text-sm text-[#14141E] font-medium">{msg.content}</p>
                        </div>
                        {msg.invoices.map((inv, j) => (
                          <div key={j} className={`px-4 py-3.5 flex items-center gap-4 ${j < msg.invoices.length - 1 ? 'border-b border-[#EEEEF4]' : ''}`}>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                {inv.vendor
                                  ? <span className="font-semibold text-sm text-[#14141E]">{inv.vendor}</span>
                                  : <span className="text-xs font-bold text-[#E5484D] bg-[#FCE9EA] px-2 py-0.5 rounded-full">Unknown vendor</span>
                                }
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F5A524] bg-[#FFF4E0] px-2 py-0.5 rounded-full">
                                  <LuTriangleAlert className="w-2.5 h-2.5" /> Flagged
                                </span>
                              </div>
                              <p className="text-xs text-[#A0A0B4]">{inv.from} · Received {inv.received}</p>
                              {inv.note && <p className="text-xs text-[#76768E] italic">{inv.note}</p>}
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                              <p className="font-bold text-sm text-[#14141E] tabular-nums">{eur(inv.amount)}</p>
                              <p className="text-[10px] font-bold" style={{ color: inv.confidence < 50 ? '#E5484D' : '#F5A524' }}>{inv.confidence}% confidence</p>
                            </div>
                            {getStatus(inv, INBOX.indexOf(inv)) === 'posted' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15B371] bg-[#E6F8EF] px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
                                <LuCircleCheck className="w-3.5 h-3.5" /> Posted
                              </span>
                            ) : (
                              <button
                                onClick={() => openReview(INBOX.indexOf(inv))}
                                className="text-xs font-bold text-[#5049CB] bg-[#F4F3FD] hover:bg-[#E5E3FB] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0"
                              >
                                Review →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                  <div className="flex items-start gap-3 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#FFD8BF] flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/mateos-logo.svg" alt="Co-Pilot" className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-[#E0E0EA] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce-dot" style={{ animationDelay: '180ms' }} />
                      <span className="w-2 h-2 bg-[#FF8C42] rounded-full animate-bounce-dot" style={{ animationDelay: '360ms' }} />
                    </div>
                  </div>
                )}

                {/* Suggested prompts — inside scroll area so they push input down naturally */}
                {chatMessages.length === 1 && !chatLoading && (
                  <div className="flex gap-2 flex-wrap pt-2 animate-fadeIn">
                    {['Show me flagged invoices', "What's due this week?", 'Summarize today\'s activity'].map(s => (
                      <button key={s} onClick={() => handleSend(s)}
                        className="text-xs font-medium text-[#55556B] bg-[#F7F7FB] border border-[#E0E0EA] hover:border-[#FF8C42] hover:text-[#B66535] px-3.5 py-1.5 rounded-full transition-colors"
                      >{s}</button>
                    ))}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input — pinned to bottom, no gap */}
              <div className="shrink-0 px-6 py-4 border-t border-[#EEEEF4] flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Ask about invoices, vendors, or financial data…"
                  className="flex-1 text-sm text-[#14141E] placeholder-[#A0A0B4] bg-transparent focus:outline-none px-3 py-2"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-[#FF8C42] hover:bg-[#DD7A3C] disabled:bg-[#EEEEF4] disabled:text-[#A0A0B4] text-[#14141E] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <LuArrowUpRight className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          )}

          {/* ═══ INTEGRATIONS ════════════════════════════════════════════ */}
          {page === 'integrations' && (
            <div className="space-y-6 animate-fadeIn">

              {/* Active connections */}
              <div className="bg-white border border-[#E0E0EA] rounded-2xl p-6 shadow-[0_2px_6px_rgba(143,81,46,0.09)]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-[#14141E] text-sm">Active connections</h3>
                    <p className="text-xs text-[#76768E] mt-0.5">3 systems connected and syncing</p>
                  </div>
                  <span className="text-xs font-bold text-[#15B371] bg-[#E6F8EF] px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#15B371] rounded-full animate-pulse" /> All systems operational
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {INTEGRATIONS.filter(i => i.status === 'connected').map((intg) => (
                    <div key={intg.name} className="flex items-center gap-3 bg-[#F7F7FB] border border-[#E0E0EA] rounded-xl p-3.5">
                      <img src={intg.logo} alt={intg.name} className="w-9 h-9 rounded-lg object-contain shrink-0 bg-white p-1 border border-[#E0E0EA]" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#14141E] truncate">{intg.name}</p>
                        <p className="text-xs text-[#76768E]">{intg.cat}</p>
                      </div>
                      <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#15B371] shrink-0">
                        <span className="w-1.5 h-1.5 bg-[#15B371] rounded-full animate-pulse" /> Live
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-white border border-[#E0E0EA] rounded-xl p-1 w-fit">
                  {[
                    { label: 'Available', id: 'available', count: INTEGRATIONS.filter(i => i.status === 'available').length },
                    { label: 'Coming soon', id: 'soon',     count: INTEGRATIONS.filter(i => i.status === 'soon').length },
                  ].map(({ label, id, count }) => (
                    <button
                      key={id}
                      onClick={() => setIntTab(id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${intTab === id ? 'bg-[#FFF7F2] text-[#B66535]' : 'text-[#76768E] hover:text-[#14141E]'}`}
                    >
                      {label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${intTab === id ? 'bg-[#FFD8BF] text-[#B66535]' : 'bg-[#EEEEF4] text-[#76768E]'}`}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-4">
                {INTEGRATIONS.filter(i => i.status === intTab).map((intg) => (
                  <div key={intg.name} className="bg-white border border-[#E0E0EA] rounded-xl p-4 shadow-[0_1px_2px_rgba(143,81,46,0.06)] flex flex-col gap-3 hover:border-[#C9C9D6] transition-colors">
                    <img src={intg.logo} alt={intg.name} className="w-10 h-10 rounded-xl object-contain bg-[#F7F7FB] p-1.5 border border-[#E0E0EA]" />
                    <div>
                      <p className="font-bold text-sm text-[#14141E]">{intg.name}</p>
                      <p className="text-xs text-[#76768E] mt-0.5">{intg.vendor} · {intg.cat}</p>
                    </div>
                    {intg.status === 'available' ? (
                      <button className="w-full mt-auto text-xs font-bold text-[#14141E] bg-[#FF8C42] hover:bg-[#DD7A3C] py-2 rounded-lg transition-colors">
                        Connect
                      </button>
                    ) : (
                      <button disabled className="w-full mt-auto text-xs font-bold text-[#A0A0B4] bg-[#F7F7FB] border border-[#E0E0EA] py-2 rounded-lg cursor-not-allowed">
                        Coming soon
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>
      {/* ── REVIEW MODAL ─────────────────────────────────────────────── */}
      {modalStage !== 'closed' && (
        <div
          className="fixed inset-0 z-50 bg-[#14141E]/40 flex items-center justify-center p-6 animate-fadeInFast"
          onClick={modalPosting === 'idle' ? closeModal : undefined}
        >
          <div
            className="bg-white rounded-2xl shadow-[0_28px_60px_rgba(20,20,30,0.25)] w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-[#EEEEF4] sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-[#14141E]">
                  {modalStage === 'processing' ? 'Analysing invoice…' : 'Review extracted data'}
                </h3>
                <p className="text-xs text-[#76768E] mt-0.5">
                  {modalStage === 'processing'
                    ? 'Agent is reading and classifying your document'
                    : activeIdx !== null && INBOX[activeIdx]?.vendor === null && !vendorApproved
                      ? `${INBOX[activeIdx]?.from} · ${eur(INBOX[activeIdx]?.amount)}`
                      : `Invoice ${activeIdx !== null && INBOX[activeIdx]?.vendor === null ? FLAGGED_RESULT.invoiceNumber : RESULT.invoiceNumber} · ${activeIdx !== null && INBOX[activeIdx]?.vendor === null ? FLAGGED_RESULT.vendor : RESULT.vendor}`
                  }
                </p>
              </div>
              <button onClick={closeModal} disabled={modalPosting !== 'idle'} className="text-[#A0A0B4] hover:text-[#14141E] disabled:opacity-30 transition-colors p-1 rounded-lg hover:bg-[#F7F7FB]">
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Processing animation */}
            {modalStage === 'processing' && (
              <div className="px-7 py-8 space-y-5">
                {MODAL_STEPS.map((step, i) => {
                  if (modalStep < i) return null;
                  const done = modalDoneSteps.includes(i);
                  return (
                    <div key={i} className="flex items-start gap-4 animate-fadeIn">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${done ? 'bg-[#E6F8EF]' : 'bg-[#FFF7F2]'}`}>
                        {done
                          ? <LuCircleCheck className="w-4 h-4 text-[#15B371]" />
                          : <LuLoader className="w-4 h-4 text-[#FF8C42] animate-spin" />
                        }
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm font-semibold transition-colors duration-300 ${done ? 'text-[#14141E]' : 'text-[#76768E]'}`}>{step.text}</p>
                        {done && (
                          <p className="text-xs text-[#A0A0B4] mt-0.5 animate-fadeInFast">{step.done}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Review content */}
            {modalStage === 'review' && (() => {
              const activeInv = activeIdx !== null ? INBOX[activeIdx] : null;
              const isUnknownVendor = activeInv?.vendor === null;
              const showSuggestion = isUnknownVendor && !vendorApproved;
              const reviewData = isUnknownVendor ? FLAGGED_RESULT : RESULT;
              return (
              <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5 animate-fadeIn">

              {/* ── VENDOR SUGGESTION STEP ───────────────────────────── */}
              {showSuggestion && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Warning banner */}
                  <div className="bg-[#FFF4E0] border border-[#FFD8BF] rounded-xl p-4 flex items-start gap-3">
                    <LuTriangleAlert className="w-4 h-4 text-[#F5A524] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#14141E]">Vendor could not be matched automatically</p>
                      <p className="text-xs text-[#76768E] mt-1 leading-relaxed">
                        This invoice arrived from <span className="font-semibold text-[#14141E]">{activeInv?.from}</span> and the sender domain is not linked to any vendor in your Business Central registry. Confidence: <span className="font-bold text-[#E5484D]">{activeInv?.confidence}%</span>.
                      </p>
                    </div>
                  </div>

                  {/* Suggested match card */}
                  <div>
                    <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block mb-2">Suggested vendor match</label>
                    <div className="border-2 border-[#5B53E8] rounded-2xl p-5 bg-[#F4F3FD]/40 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#E5E3FB] flex items-center justify-center font-bold text-[#5049CB] text-xs shrink-0">CS</div>
                        <div className="flex-1">
                          <p className="font-bold text-[#14141E]">{SUGGESTED_VENDOR.name}</p>
                          <p className="text-xs text-[#76768E] mt-0.5">BC vendor ID: <span className="font-mono font-semibold">{SUGGESTED_VENDOR.id}</span></p>
                        </div>
                        <span className="text-xs font-bold text-[#5049CB] bg-[#E5E3FB] px-2.5 py-1 rounded-full shrink-0">{SUGGESTED_VENDOR.match} match</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white rounded-lg px-3 py-2.5 border border-[#E5E3FB]">
                          <p className="text-[#A0A0B4] font-medium">Past invoices matched</p>
                          <p className="font-bold text-[#14141E] mt-0.5">{SUGGESTED_VENDOR.pastInvoices} invoices</p>
                        </div>
                        <div className="bg-white rounded-lg px-3 py-2.5 border border-[#E5E3FB]">
                          <p className="text-[#A0A0B4] font-medium">Why this match?</p>
                          <p className="font-medium text-[#14141E] mt-0.5 leading-tight">{SUGGESTED_VENDOR.hint}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setVendorApproved(true)}
                      className="flex-1 bg-[#5B53E8] hover:bg-[#5049CB] text-white font-bold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <LuCheck className="w-4 h-4" /> Approve vendor suggestion
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-[#EEEEF4] hover:bg-[#E0E0EA] text-[#3C3C4F] font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* ── FULL REVIEW (after vendor approved or normal invoice) ─ */}
              {!showSuggestion && (<>
              {/* Confidence summary */}
              <div className="bg-[#F7F7FB] border border-[#E0E0EA] rounded-xl px-4 py-3 flex items-center gap-4">
                <span className="text-xs font-bold text-[#76768E] uppercase tracking-wider shrink-0">Agent confidence</span>
                <div className="flex items-center gap-2 ml-auto">
                  {(isUnknownVendor ? [
                    { label: 'Vendor match',   score: '100%'  },
                    { label: 'GL allocation',  score: '97.5%' },
                    { label: 'VAT validation', score: '100%'  },
                  ] : [
                    { label: 'Vendor match',   score: '99%'   },
                    { label: 'GL allocation',  score: '98.7%' },
                    { label: 'VAT validation', score: '100%'  },
                  ]).map(({ label, score }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-[#15B371] bg-[#E6F8EF] whitespace-nowrap">
                      <LuCircleCheck className="w-3 h-3" /> {label} <span className="font-mono">{score}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Environment banner */}
              <div className="bg-[#F4F3FD] border border-[#E5E3FB] rounded-xl px-4 py-3 flex items-center gap-3">
                <LuDatabase className="w-4 h-4 text-[#5049CB] shrink-0" />
                <p className="text-xs text-[#373287]/80 font-medium">
                  Mapped to Chart of Accounts for <span className="font-bold">PwC Internal</span>. Approving posts directly to their BC instance.
                </p>
              </div>

              {/* Header fields */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Invoice Number', value: reviewData.invoiceNumber },
                  { label: 'Invoice Date',   value: reviewData.invoiceDate   },
                  { label: 'Due Date',       value: reviewData.dueDate       },
                  { label: 'Vendor',         value: reviewData.vendor, span: true },
                  { label: 'Vendor ID',      value: reviewData.vendorId      },
                  { label: 'PO Reference',   value: reviewData.poRef         },
                ].map(({ label, value, span }) => (
                  <div key={label} className={`space-y-1 ${span ? 'col-span-2' : ''}`}>
                    <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block">{label}</label>
                    <input readOnly value={value} className="w-full bg-[#F7F7FB] border border-[#E0E0EA] rounded-lg px-3 py-2 font-medium text-sm text-[#14141E] focus:outline-none" />
                  </div>
                ))}
              </div>

              {/* Line items */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block">Line Items</label>
                <div className="border border-[#E0E0EA] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F7F7FB] border-b border-[#E0E0EA]">
                        {['Description', 'Qty', 'Unit price', 'Amount', 'GL'].map((h) => (
                          <th key={h} className={`px-3 py-2.5 font-bold text-[#A0A0B4] uppercase tracking-wider text-[10px] ${h === 'Description' ? 'text-left' : h === 'GL' ? 'text-center' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reviewData.lineItems.map((item, i) => (
                        <tr key={i} className={i < reviewData.lineItems.length - 1 ? 'border-b border-[#EEEEF4]' : ''}>
                          <td className="px-3 py-2.5 text-[#3C3C4F] font-medium">{item.description}</td>
                          <td className="px-3 py-2.5 text-[#55556B] text-right tabular-nums">{item.qty} {item.unit}</td>
                          <td className="px-3 py-2.5 text-[#55556B] text-right tabular-nums">{eur(item.unitPrice)}</td>
                          <td className="px-3 py-2.5 text-[#14141E] font-semibold text-right tabular-nums">{eur(item.amount)}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[10px] font-mono bg-[#FFF7F2] text-[#B66535] border border-[#FFEDE1] px-1.5 py-0.5 rounded font-bold">{item.gl}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="space-y-1.5 w-56">
                  <div className="flex justify-between text-sm text-[#76768E]"><span>Subtotal</span><span className="tabular-nums font-medium">{eur(reviewData.subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-[#76768E]"><span>VAT 21%</span><span className="tabular-nums font-medium">{eur(reviewData.vat)}</span></div>
                  <div className="flex justify-between text-sm font-bold text-[#14141E] border-t border-[#E0E0EA] pt-2"><span>Total</span><span className="tabular-nums">{eur(reviewData.total)}</span></div>
                </div>
              </div>

              {/* GL suggestion */}
              <div className="bg-[#FFF7F2] border border-[#FFEDE1] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#A0A0B4] uppercase tracking-wider block mb-0.5">Suggested GL Account</label>
                  <span className="font-mono font-semibold text-sm text-[#683C27]">{reviewData.glCode}</span>
                </div>
                <span className="text-[10px] bg-[#E6F8EF] text-[#15B371] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Auto-matched</span>
              </div>
              </>)}

            </div>
              );
            })()}

            {/* Sticky footer — always visible when in review and vendor step done */}
            {modalStage === 'review' && (activeIdx === null || INBOX[activeIdx]?.vendor !== null || vendorApproved) && (
              <div className="shrink-0 px-7 py-4 border-t border-[#EEEEF4] flex gap-3 bg-white rounded-b-2xl">
                <button
                  onClick={handlePost}
                  disabled={modalPosting !== 'idle'}
                  className={`flex-1 font-bold text-sm py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    modalPosting === 'success'
                      ? 'bg-[#E6F8EF] text-[#15B371]'
                      : 'bg-[#FF8C42] hover:bg-[#DD7A3C] text-[#14141E] shadow-sm'
                  }`}
                >
                  {modalPosting === 'idle'    && <><LuCheck    className="w-4 h-4" /> Post to Business Central</>}
                  {modalPosting === 'loading' && <><LuLoader   className="w-4 h-4 animate-spin" /> Posting to Business Central…</>}
                  {modalPosting === 'success' && <><LuCircleCheck className="w-4 h-4" /> Posted to Business Central</>}
                </button>
                {modalPosting === 'idle' && (
                  <button
                    onClick={closeModal}
                    className="bg-[#EEEEF4] hover:bg-[#E0E0EA] text-[#3C3C4F] font-bold text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <LuFlag className="w-4 h-4" /> Flag Issue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
