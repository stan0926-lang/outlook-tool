
import React, { useState, useEffect, useRef } from 'react';
import { Address, Group, EmailTemplate, RecipientType, GlobalVariable } from '../types';
import { fetchAddresses, fetchGroups, fetchTemplates, fetchGlobals, resolveTextVariables } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconAdd, IconClose, IconRocket, IconChevronDown, IconDocumentText, IconPeople, IconCheck, IconArrowUp, IconArrowDown } from './ui/Icons';

export const MailComposer: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [globals, setGlobals] = useState<GlobalVariable[]>([]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipients, setRecipients] = useState<{addressId:string, name:string, email:string, type:RecipientType, organization:string, department:string, order?:number}[]>([]);
  const [subject, setSubject] = useState('');
  
  // For Variable Substitution logic
  const [rawBody, setRawBody] = useState(''); // Keeps the original text with {variables}
  const [displayBodyHtml, setDisplayBodyHtml] = useState(''); // HTML with highlighted variables
  const [displaySubjectHtml, setDisplaySubjectHtml] = useState(''); // HTML with highlighted variables
  const bodyEditorRef = useRef<HTMLDivElement>(null);
  const subjectEditorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false); // IME入力中フラグ
  const isEditingRef = useRef(false); // ユーザーが編集中フラグ
  const [groupChangeCounter, setGroupChangeCounter] = useState(0); // グループ変更カウンター

  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'CONTACTS' | 'GROUPS'>('CONTACTS');
  const [pickerSearch, setPickerSearch] = useState('');

  // Track the "Primary" Group context for variable substitution
  const [activeGroupContext, setActiveGroupContext] = useState<Group | undefined>(undefined);

  useEffect(() => {
    Promise.all([fetchAddresses(), fetchGroups(), fetchTemplates(), fetchGlobals()]).then(([a, g, t, glb]) => {
      setAddresses(a); setGroups(g); setTemplates(t); setGlobals(glb);
    });
  }, []);

  // カーソル位置を保存する関数
  const saveCursorPosition = (element: HTMLElement | null) => {
    if (!element) return null;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const caretOffset = preCaretRange.toString().length;
    
    return caretOffset;
  };

  // カーソル位置を復元する関数
  const restoreCursorPosition = (element: HTMLElement | null, offset: number | null) => {
    if (!element || offset === null) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    let charCount = 0;
    let foundNode: Node | null = null;
    let foundOffset = 0;
    
    const findTextNode = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (charCount + textLength >= offset) {
          foundNode = node;
          foundOffset = offset - charCount;
          return true;
        }
        charCount += textLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (findTextNode(node.childNodes[i])) return true;
        }
      }
      return false;
    };
    
    findTextNode(element);
    
    if (foundNode) {
      const range = document.createRange();
      range.setStart(foundNode, foundOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Update HTML display when group changes or template changes
  useEffect(() => {
    if (isComposingRef.current) return; // IME入力中は更新しない
    
    const { html: bodyHtml } = resolveTextVariables(rawBody, activeGroupContext, globals);
    const { html: subjectHtml } = resolveTextVariables(subject, activeGroupContext, globals);
    
    // DOMに直接HTMLを設定（dangerouslySetInnerHTMLではなく）
    if (bodyEditorRef.current) {
      bodyEditorRef.current.innerHTML = bodyHtml || '<span style="color: #94a3b8;">本文を入力してください。変数は {変数名} の形式で入力できます。</span>';
    }
    if (subjectEditorRef.current) {
      subjectEditorRef.current.innerHTML = subjectHtml || '<span style="color: #94a3b8;">件名を入力</span>';
    }
  }, [activeGroupContext, globals, groupChangeCounter]);


  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      // 1. Set Raw Content
      setSubject(tmpl.subject);
      setRawBody(tmpl.body);

      // 2. Reset Recipients
      const newRecs: any[] = [];
      tmpl.defaultRecipients.forEach(dr => {
        const addr = addresses.find(a => a.id === dr.addressId);
        if (addr) newRecs.push({ addressId: addr.id, name: addr.name, email: addr.email, type: dr.type, organization: addr.organization, department: addr.department });
      });
      setRecipients(newRecs);
      
      // グループコンテキストをリセット
      setActiveGroupContext(undefined);
      
      // HTMLを即座に更新
      const { html: bodyHtml } = resolveTextVariables(tmpl.body, undefined, globals);
      const { html: subjectHtml } = resolveTextVariables(tmpl.subject, undefined, globals);
      setDisplayBodyHtml(bodyHtml);
      setDisplaySubjectHtml(subjectHtml);
      
      // DOMに直接設定
      setTimeout(() => {
        if (bodyEditorRef.current) {
          bodyEditorRef.current.innerHTML = bodyHtml;
        }
        if (subjectEditorRef.current) {
          subjectEditorRef.current.innerHTML = subjectHtml;
        }
      }, 0);
      
      // 編集フラグをリセット
      isEditingRef.current = false;
      
      // グループ変更カウンターを更新して再レンダリングをトリガー
      setGroupChangeCounter(prev => prev + 1);
    }
  };

  const launchOutlook = () => {
    const to = recipients.filter(r => r.type === 'TO').map(r => r.email).join(';');
    const cc = recipients.filter(r => r.type === 'CC').map(r => r.email).join(';');
    const bcc = recipients.filter(r => r.type === 'BCC').map(r => r.email).join(';');
    
    // Final Resolve before sending to ensure plain text
    const { text: resolvedBody } = resolveTextVariables(rawBody, activeGroupContext, globals);
    const { text: resolvedSubject } = resolveTextVariables(subject, activeGroupContext, globals);

    let link = `mailto:${to}?subject=${encodeURIComponent(resolvedSubject)}&body=${encodeURIComponent(resolvedBody)}`;
    if (cc) link += `&cc=${cc}`;
    if (bcc) link += `&bcc=${bcc}`;
    window.location.href = link;
  };

  const handleGroupSelect = (g: Group) => {
      // 前のグループのメンバーを削除（activeGroupContextが存在する場合）
      let filteredRecipients = recipients;
      if (activeGroupContext) {
        // 前のグループのmemberIdsに含まれる宛先を削除
        const previousMemberIds = activeGroupContext.memberIds.map(m => m.id);
        filteredRecipients = recipients.filter(r => !previousMemberIds.includes(r.addressId));
      }
      
      // 新しいグループのメンバーを追加（recipientTypeとorderを反映）
      const newMembers = g.memberIds
        .map(m => {
          const addr = addresses.find(a => a.id === m.id);
          if (!addr) return null;
          return {
            addressId: addr.id, 
            name: addr.name, 
            email: addr.email, 
            type: m.recipientType.toUpperCase() as RecipientType, 
            organization: addr.organization,
            department: addr.department,
            order: m.order
          };
        })
        .filter(a => a !== null)
        .sort((a, b) => (a!.order || 0) - (b!.order || 0));
      
      setRecipients([...filteredRecipients, ...newMembers]);
      
      // グループコンテキストを更新
      setActiveGroupContext(g);
      
      // グループ変更を通知してHTML再生成を強制
      setGroupChangeCounter(prev => prev + 1);
      
      // 編集フラグをリセット
      isEditingRef.current = false;
      
      // HTMLを即座に更新
      const { html: bodyHtml } = resolveTextVariables(rawBody, g, globals);
      const { html: subjectHtml } = resolveTextVariables(subject, g, globals);
      setDisplayBodyHtml(bodyHtml);
      setDisplaySubjectHtml(subjectHtml);
      
      setShowAddressPicker(false);
  };

  const moveRecipient = (index: number, direction: 'up' | 'down') => {
    const newRecipients = [...recipients];
    if (direction === 'up' && index > 0) {
      [newRecipients[index], newRecipients[index - 1]] = [newRecipients[index - 1], newRecipients[index]];
    } else if (direction === 'down' && index < newRecipients.length - 1) {
      [newRecipients[index], newRecipients[index + 1]] = [newRecipients[index + 1], newRecipients[index]];
    }
    setRecipients(newRecipients);
  };

  const darkInput = "w-full border border-slate-600 rounded-lg p-3 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium";

  // Helper for Pastel Badges
  const recipientTypeStyles = {
    'TO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'CC': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'BCC': 'bg-pink-100 text-pink-700 border-pink-200'
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)] pb-6">
      {/* LEFT COLUMN: Settings (Template & Recipients) */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 h-full">
        {/* 1. Template Selection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <IconDocumentText className="w-5 h-5 text-indigo-500"/>
            テンプレート
          </h2>
          <div className="relative">
             <select 
               className="w-full border border-slate-600 rounded-lg p-3 pl-4 pr-10 appearance-none bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" 
               value={selectedTemplateId} 
               onChange={e => handleTemplateChange(e.target.value)}
             >
               <option value="">（テンプレートなし）</option>
               {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
             </select>
             <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5"/>
          </div>
        </div>

        {/* 2. Recipients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden relative">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <IconPeople className="w-5 h-5 text-indigo-500"/> 宛先リスト
            </h2>
            <Button size="sm" onClick={() => setShowAddressPicker(true)} variant="secondary" className="flex items-center gap-1 py-1.5 px-3 text-sm">
              <IconAdd className="w-4 h-4"/> 追加
            </Button>
          </div>
          
          {/* Active Context Indicator */}
          {activeGroupContext && (
              <div className="bg-orange-50 border border-orange-100 text-orange-800 text-xs p-2 rounded mb-2 flex justify-between items-center">
                  <span>変数適用中: <b>{activeGroupContext.group_name}</b></span>
                  <button onClick={() => setActiveGroupContext(undefined)} className="hover:text-red-500"><IconClose className="w-3 h-3"/></button>
              </div>
          )}

          <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1">
            {recipients.length === 0 && (
              <div className="w-full text-slate-400 text-xs text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                宛先が設定されていません
              </div>
            )}
            {recipients.map((r, index) => (
              <div key={`${r.addressId}-${index}`} className="flex items-center p-2 border border-slate-200 rounded-lg bg-white shadow-sm hover:border-indigo-200 transition-all">
                 
                 <div className="flex flex-col mr-2">
                     <button onClick={() => moveRecipient(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><IconArrowUp className="w-3 h-3"/></button>
                     <button onClick={() => moveRecipient(index, 'down')} disabled={index === recipients.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><IconArrowDown className="w-3 h-3"/></button>
                 </div>
                 <div className="mr-2">
                   <select 
                     value={r.type} 
                     onChange={(e) => {
                       const updated = [...recipients];
                       updated[index].type = e.target.value as RecipientType;
                       setRecipients(updated);
                     }} 
                     className={`text-xs border rounded py-1 px-1 cursor-pointer focus:ring-1 focus:ring-indigo-200 outline-none font-bold ${recipientTypeStyles[r.type]}`}
                   >
                     <option value="TO">TO</option>
                     <option value="CC">CC</option>
                     <option value="BCC">BCC</option>
                   </select>
                 </div>
                 <div className="mr-auto min-w-0 flex-1 overflow-hidden">
                    <div className="font-bold text-sm text-slate-800 whitespace-nowrap animate-marquee-hover">{r.name}</div>
                    <div className="text-xs text-slate-500 font-bold whitespace-nowrap ml-3 animate-marquee-hover">{r.email}</div>
                    <div className="text-xs text-slate-600 font-semibold whitespace-nowrap ml-3 animate-marquee-hover">
                      {r.organization}{r.department ? ` / ${r.department}` : ''}
                    </div>
                 </div>
                 <button 
                    onClick={() => {
                        const newRecs = [...recipients];
                        newRecs.splice(index, 1);
                        setRecipients(newRecs);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <IconClose className="w-4 h-4"/>
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Editor */}
      <div className="w-full md:w-2/3 flex flex-col h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2 flex-shrink-0">
          <IconCheck className="w-5 h-5 text-indigo-500"/> メール編集
        </h2>
        
        <div className="mb-4 flex-shrink-0">
          <label className="block font-bold text-slate-600 mb-1.5 text-xs uppercase tracking-wide">件名</label>
          <div 
            ref={subjectEditorRef}
            className={`${darkInput} min-h-[42px] whitespace-pre-wrap break-words`}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => { isEditingRef.current = true; }}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={(e) => { 
              isComposingRef.current = false; 
              setSubject(e.currentTarget.innerText);
            }}
            onInput={(e) => {
              isEditingRef.current = true;
              if (!isComposingRef.current) {
                setSubject(e.currentTarget.innerText);
              }
            }}
            onBlur={(e) => {
              setSubject(e.currentTarget.innerText);
              isEditingRef.current = false;
            }}
          />
        </div>
        
        <div className="mb-4 flex-1 flex flex-col min-h-0">
           <label className="block font-bold text-slate-600 mb-1.5 text-xs uppercase tracking-wide flex-shrink-0">本文</label>
           <div 
             ref={bodyEditorRef}
             className={`${darkInput} flex-1 overflow-auto whitespace-pre-wrap font-mono`}
             contentEditable
             suppressContentEditableWarning
             onFocus={() => { isEditingRef.current = true; }}
             onCompositionStart={() => { isComposingRef.current = true; }}
             onCompositionEnd={(e) => { 
               isComposingRef.current = false; 
               setRawBody(e.currentTarget.innerText);
             }}
             onInput={(e) => {
               isEditingRef.current = true;
               if (!isComposingRef.current) {
                 setRawBody(e.currentTarget.innerText);
               }
             }}
             onBlur={(e) => {
               setRawBody(e.currentTarget.innerText);
               isEditingRef.current = false;
             }}
           />
           <p className="text-[10px] text-slate-400 mt-1 text-right">※ <code>{`{変数}`}</code>の形式で入力すると、グループ選択時に<span className="text-orange-500 font-bold">オレンジ色</span>で置換表示されます。</p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 flex-shrink-0">
          <Button size="lg" onClick={launchOutlook} className="flex gap-2 items-center w-full md:w-auto shadow-lg shadow-indigo-100">
            <IconRocket className="w-5 h-5"/> Outlookを起動
          </Button>
        </div>
      </div>

      {/* Address Picker Modal */}
      {showAddressPicker && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-100 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button 
                  className={`flex-1 py-3 font-bold transition-colors text-sm ${pickerTab==='CONTACTS' ? 'bg-indigo-50 text-indigo-700' : 'bg-white hover:bg-slate-50 text-slate-500'}`} 
                  onClick={()=>setPickerTab('CONTACTS')}
                >
                  連絡先から
                </button>
                <button 
                  className={`flex-1 py-3 font-bold transition-colors text-sm ${pickerTab==='GROUPS' ? 'bg-indigo-50 text-indigo-700' : 'bg-white hover:bg-slate-50 text-slate-500'}`} 
                  onClick={()=>setPickerTab('GROUPS')}
                >
                  グループから
                </button>
                <button className="px-5 hover:bg-red-50 hover:text-red-500 transition-colors border-l border-slate-200 text-slate-400" onClick={()=>setShowAddressPicker(false)}>
                  <IconClose className="w-5 h-5"/>
                </button>
              </div>
              
              <div className="p-4 border-b border-slate-100 bg-white">
                   <input className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="検索..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
              </div>
              
              <div className="overflow-auto p-4 flex-1 bg-white">
                 {pickerTab === 'CONTACTS' ? (
                    <div className="space-y-2">
                    {addresses.filter(a => a.name.includes(pickerSearch) || a.email.includes(pickerSearch)).map(a => {
                      const isSelected = recipients.some(r => r.addressId === a.id);
                      return (
                        <div 
                          key={a.id} 
                          onClick={() => {
                            if (!isSelected) setRecipients([...recipients, {addressId: a.id, name: a.name, email: a.email, type: 'TO', organization: a.organization, department: a.department}]);
                          }} 
                          className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${
                            isSelected 
                            ? 'bg-indigo-50 border-indigo-200 opacity-60' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="text-slate-800 font-medium">{a.name}</div>
                            <div className="text-xs text-slate-500">{a.organization} | {a.department}</div>
                          </div>
                          {!isSelected && <IconAdd className="w-5 h-5 text-slate-300"/>}
                          {isSelected && <IconCheck className="w-5 h-5 text-indigo-600"/>}
                        </div>
                      );
                    })}
                    </div>
                 ) : (
                    <div className="space-y-2">
                    {groups.filter(g => g.group_name.includes(pickerSearch)).map(g => (
                      <div 
                        key={g.id} 
                        className="p-4 border border-slate-200 rounded-lg bg-white flex justify-between items-center hover:border-indigo-300 hover:shadow-sm transition-all"
                      >
                         <div>
                           <div className="font-bold text-slate-800">{g.group_name}</div>
                           <div className="text-xs text-slate-500">
                             {g.memberIds.length}名のメンバー
                             {g.memberIds.filter(m => m.recipientType === 'to').length > 0 && ` (TO: ${g.memberIds.filter(m => m.recipientType === 'to').length})`}
                             {g.memberIds.filter(m => m.recipientType === 'cc').length > 0 && ` (CC: ${g.memberIds.filter(m => m.recipientType === 'cc').length})`}
                             {g.memberIds.filter(m => m.recipientType === 'bcc').length > 0 && ` (BCC: ${g.memberIds.filter(m => m.recipientType === 'bcc').length})`}
                           </div>
                           {/* Show variable preview */}
                           {g.customAttributes && g.customAttributes.length > 0 && (
                               <div className="flex gap-1 mt-1 flex-wrap">
                                   {g.customAttributes.map((attr,i) => (
                                       <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded border border-slate-200">{attr.key}</span>
                                   ))}
                               </div>
                           )}
                         </div>
                         <Button size="sm" variant="secondary" onClick={() => handleGroupSelect(g)}>
                           選択
                         </Button>
                      </div>
                    ))}
                    </div>
                 )}
              </div>
            </div>
         </div>
      )}
    </div>
  );
};