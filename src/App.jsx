import { useState } from 'react';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState(null);
  

  const handleDemoTrigger = () => {
    setIsProcessing(true);
    setProcessingStep(1); // Start terminal step 1

    // Simulate multi-step agent reasoning terminal
    setTimeout(() => setProcessingStep(2), 1200);
    setTimeout(() => setProcessingStep(3), 2600);
    
    // Finish processing and show results
    setTimeout(() => {
      setResult({
        vendor: "Global Tech Solutions",
        amount: "€4,250.00",
        glCode: "6200 - IT Consulting",
        confidence: "98.7%"
      });
      setIsProcessing(false);
      setProcessingStep(0);
    }, 4000);
  };

  return (
    <div className="flex h-screen bg-[#fbf9f6] text-gray-900 font-sans overflow-hidden">
      
      {/* SIDEBAR - Warm Charcoal/Dark Gray tone to match PwC brand identity */}
      <aside className="w-72 bg-[#1a1513] text-gray-200 flex flex-col justify-between p-6">
        <div>
          {/* Brand Heading */}
          <div className="flex items-center gap-3 mb-10 mt-2">
            <div className="grid grid-cols-2 gap-1 w-6 h-6">
              <div className="bg-[#ffb612] w-2.5 h-2.5 rounded-sm"></div>
              <div className="bg-[#eb8c00] w-2.5 h-2.5 rounded-sm"></div>
              <div className="bg-[#df2512] w-2.5 h-2.5 rounded-sm"></div>
              <div className="bg-[#b30a00] w-2.5 h-2.5 rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">pwc</h1>
              <span className="text-[10px] tracking-widest text-gray-400 font-semibold uppercase block mt-0.5">
                Invoice Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Workspace Links */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-gray-500 block mb-3">
                Workspace
              </span>
              <nav className="space-y-1.5">
                <div className="flex justify-between items-center bg-[#2d2522] text-white px-4 py-2.5 rounded-lg font-medium cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span>📥</span> Invoice intake
                  </div>
                  <span className="bg-[#d04a02] text-white text-xs px-2 py-0.5 rounded-full font-bold">3</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-medium">
                  <span>📄</span> Documents
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-medium">
                  <span>👥</span> Clients
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-medium">
                  <span>📋</span> Posting log
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer Sidebar Widgets */}
        <div className="space-y-6 pt-6 border-t border-[#2d2522]">
          {/* Connected Systems Status */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block mb-3">
              Connected Systems
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Business Central</span>
                <span className="text-green-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">SharePoint</span>
                <span className="text-gray-400">Synced 3m ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Outlook</span>
                <span className="text-green-400 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Live
                </span>
              </div>
            </div>
          </div>

          {/* Identity Profile Badge */}
          <div className="flex items-center gap-3 bg-[#2d2522] p-3 rounded-xl">
            <div className="bg-[#d04a02] text-white font-bold w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-inner">
              SV
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Sanne de Vries</div>
              <div className="text-xs text-gray-400">Finance · PwC NL</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE PANEL */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Sticky Header bar with Client Selector & Stepper */}
        <header className="bg-white border-b border-gray-200 px-10 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Invoice intake</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Accounts payable</p>
            </div>
          </div>

          {/* Status Stepper Alignment */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${!result && !isProcessing ? 'bg-[#d04a02] text-white' : 'bg-gray-100 text-gray-600'}`}>1</span>
              <span className={`font-semibold ${!result && !isProcessing ? 'text-gray-900' : 'text-gray-500'}`}>Upload</span>
            </div>
            <div className="w-10 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isProcessing || result ? 'bg-[#d04a02] text-white' : 'bg-gray-100 text-gray-600'}`}>2</span>
              <span className={`font-semibold ${isProcessing || result ? 'text-gray-900' : 'text-gray-500'}`}>Review</span>
            </div>
            <div className="w-10 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-gray-400 font-medium">Post</span>
            </div>
            <span className="bg-orange-50 text-[#d04a02] text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md ml-4 uppercase border border-orange-200">
              Demo
            </span>
          </div>
        </header>

        {/* Dynamic Workspace Wrapper Context */}
        <div className="flex-1 p-10 max-w-5xl w-full mx-auto space-y-8">
          
          {/* STATE 1: Drop Area View */}
          {!isProcessing && !result && (
            <div className="animate-fade-in transition-opacity duration-300">
              <div className="space-y-2 mb-8">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Drop an invoice to start</h3>
                <p className="text-gray-600 max-w-2xl leading-relaxed text-sm font-medium">
                  Upload a supplier or client invoice for <span className="font-bold text-gray-900">PwC Internal</span>. Invoice Intelligence reads it, matches the client against your master data, and prepares it for posting.
                </p>
              </div>

              {/* Centered Dropzone Card Layout */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-14 text-center shadow-sm flex flex-col items-center justify-center space-y-6">
                <div className="w-14 h-14 bg-orange-50 text-[#d04a02] rounded-2xl flex items-center justify-center text-2xl font-light shadow-sm">
                  📤
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">Drop your invoice here</h4>
                  <p className="text-gray-400 text-xs mt-1 font-medium">or browse — PDF, PNG or JPG up to 20 MB</p>
                </div>
                
                {/* Simulated Trigger CTA Controls */}
                <div className="flex gap-3">
                  <button 
                    onClick={handleDemoTrigger}
                    className="bg-[#d04a02] hover:bg-[#b33f02] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    📥 Browse files
                  </button>
                  <button 
                    onClick={handleDemoTrigger}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
                  >
                    Use a sample invoice
                  </button>
                </div>
              </div>

              {/* Informational Lower Cards Pillar */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-2">
                  <div className="text-lg">🔍</div>
                  <h5 className="font-bold text-gray-800 text-sm">Reads any layout</h5>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Header fields, line items, VAT and totals — no template setup required.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-2">
                  <div className="text-lg">🛡️</div>
                  <h5 className="font-bold text-gray-800 text-sm">Matches the client</h5>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Resolves the counterparty automatically directly against a Business Central account.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-2">
                  <div className="text-lg">💾</div>
                  <h5 className="font-bold text-gray-800 text-sm">Posts in one click</h5>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Creates the finalized data entry draft inside Business Central with code mappings applied.</p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Processing Live Terminal Screen */}
          {isProcessing && (
            <div className="space-y-4 animate-fade-in transition-opacity duration-300">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Agent processing execution...</h3>
              
              {/* Terminal Block */}
              <div className="bg-[#1a1513] text-gray-300 p-6 rounded-2xl font-mono text-sm shadow-xl border border-gray-800 space-y-5 leading-relaxed min-h-50">
                
                {/* Step 1 */}
                {processingStep >= 1 && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="text-[#ffb612]">
                      [AGENT LOG] Instantiating neural layout analysis and structural grid extraction...
                    </div>
                    {processingStep >= 2 ? (
                      <div className="text-blue-200/80 ml-6 flex items-center gap-2">
                        ✓ <span className="opacity-80">Layout table parsing complete: Matrix coordinates locked safely.</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 ml-6 animate-pulse">Scanning document layout...</div>
                    )}
                  </div>
                )}

                {/* Step 2 */}
                {processingStep >= 2 && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="text-[#ffb612]">
                      [AGENT LOG] Cross-checking extracted vendor credentials with client Master Vendor Registry...
                    </div>
                    {processingStep >= 3 ? (
                      <div className="text-blue-200/80 ml-6 flex items-center gap-2">
                        ✓ <span className="opacity-80">Entity match identified: Verified supplier linked directly inside current PwC Internal ledger accounts.</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 ml-6 animate-pulse">Querying PwC Internal databases...</div>
                    )}
                  </div>
                )}

                {/* Step 3 */}
                {processingStep >= 3 && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="text-[#ffb612]">
                      [AGENT LOG] Simulating smart pattern analysis against historical Chart of Accounts logs...
                    </div>
                    <div className="text-blue-200/80 ml-6 flex items-center gap-2">
                      ✓ <span className="opacity-80">General Ledger auto-allocation parameters optimized with high confidence value.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: Finalized Validated Parsing Results Pane */}
          {result && (
            <div className="space-y-6 animate-fade-in transition-opacity duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Review extracted data</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Please check and validate prior to syncing ledger tables.</p>
                </div>
                <button 
                  onClick={() => setResult(null)}
                  className="text-sm font-bold text-[#d04a02] hover:underline flex items-center gap-1"
                >
                  ← Upload a different file
                </button>
              </div>

              {/* Multi-Client Context Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                 <div className="text-blue-600 text-xl mt-0.5">🗄️</div>
                 <div>
                     <h5 className="text-sm font-bold text-blue-900 tracking-tight">Target Environment: PwC Internal</h5>
                     <p className="text-xs text-blue-800/80 mt-1 font-medium leading-relaxed">
                        Data from this invoice has been mapped specifically to the Chart of Accounts for <span className="font-bold">PwC Internal</span>. 
                        Approving this will route the transaction directly to their isolated database instance.
                     </p>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Left Side: Extracted form entries block */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-2 space-y-5">
                  <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800">Ledger Entry Field Mappings</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">
                      Confidence Level: {result.confidence}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Counterparty / Supplier</label>
                      <input type="text" readOnly value={result.vendor} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-sm text-gray-800 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Transaction Amount</label>
                      <input type="text" readOnly value={result.amount} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-sm text-gray-800 focus:outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Suggested General Ledger (GL) Account</label>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={result.glCode} className="w-full bg-orange-50/50 border border-orange-200 text-orange-900 font-mono rounded-lg px-3 py-2 font-semibold text-sm focus:outline-none" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => alert(`Successfully   pushed invoice to the PwC  Business Central ledger `)} 
                      className="flex-1 bg-[#d04a02] hover:bg-[#b33f02] text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition-all"
                    >
                      ✔ Post to PwC DB
                    </button>
                    <button 
                      onClick={() => setResult(null)} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                    >
                      Flag Issue
                    </button>
                  </div>
                </div>

                {/* Right Side Pane Component: Explanation Audit Log */}
                <div className="bg-[#2d2522] text-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#3e3430] pb-2">
                      💡 Agent Reasoning Trail
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      Matched <span className="text-white font-semibold">"{ result.vendor}"</span> using PwC Internal master identifier key validation indexes.
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      Line item evaluation matches pattern parameters mapping historical transactions recorded on previous PwC Internal fiscal profiles. Recommending auto-allocation target parameter to <span className="text-orange-300 font-mono">{result.glCode}</span>.
                    </p>
                  </div>
                  <div className="bg-[#1a1513] p-3 rounded-xl border border-[#3e3430] text-[10px] text-gray-400 font-mono mt-6">
                    Audit validation record: ID_MATEOS_99182_CY
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;