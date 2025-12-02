
import React, { useState, useEffect } from 'react';
import { EmailTemplate, Address, Group, RecipientType } from '../types';
import { fetchTemplates, saveTemplate, deleteTemplate, fetchAddresses, fetchGroups } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconDocumentText, IconAdd, IconCreate, IconTrash, IconClose, IconArrowUp, IconArrowDown, IconSearch, IconCheck } from './ui/Icons';

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EmailTemplate>({ 
    id: '', title: '', subject: '', body: '', defaultRecipients: [] 
  });
  
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'CONTACTS' | 'GROUPS'>('CONTACTS');
  const [recipientSearch, setRecipientSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [tData, aData, gData] = await Promise.all([fetchTemplates(), fetchAddresses(), fetchGroups()]);
    setTemplates([...tData]);
    setAddresses([...aData]);
    setGroups([...gData]);
  };

  const handleCreate = () => {
    setEditingId('new');
    setFormData({ id: '', title: '', subject: '', body: '', defaultRecipients: [] });
  };

  const handleSave = async () => {
    if (!formData.title) return;
    await saveTemplate(formData);
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('削除しますか？')) {
      await deleteTemplate(id);
      loadData();
    }
  };

  const addRecipient = (addressId: string) => {
    if (formData.defaultRecipients.some(r => r.addressId === addressId)) return;
    setFormData({
      ...formData,
      defaultRecipients: [...formData.defaultRecipients, { addressId, type: 'TO' }]
    });
    setIsRecipientModalOpen(false);
  };

  const addGroupRecipients = (group: Group) => {
    const existingIds = new Set(formData.defaultRecipients.map(r => r.addressId));
    const newRecipients = [...formData.defaultRecipients];
    let count = 0;

    group.memberIds.forEach(mid => {
      if (!existingIds.has(mid)) {
        newRecipients.push({ addressId: mid, type: 'TO' });
        existingIds.add(mid);
        count++;
      }
    });

    if (count > 0) {
      setFormData({ ...formData, defaultRecipients: newRecipients });
      setIsRecipientModalOpen(false);
    } else {
      alert('選択されたグループのメンバーは既に追加されているか、メンバーがいません。');
    }
  };

  const moveRecipient = (index: number, direction: 'up' | 'down') => {
    const newRecipients = [...formData.defaultRecipients];
    if (direction === 'up' && index > 0) {
      [newRecipients[index], newRecipients[index - 1]] = [newRecipients[index - 1], newRecipients[index]];
    } else if (direction === 'down' && index < newRecipients.length - 1) {
      [newRecipients[index], newRecipients[index + 1]] = [newRecipients[index + 1], newRecipients[index]];
    }
    setFormData({ ...formData, defaultRecipients: newRecipients });
  };

  const darkInput = "w-full border border-slate-600 rounded-lg p-2.5 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  // Helper for Pastel Badges
  const recipientTypeStyles = {
    'TO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'CC': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'BCC': 'bg-pink-100 text-pink-700 border-pink-200'
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-120px)]">
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-800">テンプレート管理</h2>
        <Button size="sm" onClick={handleCreate}><IconAdd className="w-4 h-4"/> 新規作成</Button>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-white min-h-0">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {templates.map(item => (
            <div key={item.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-lg text-slate-800">{item.title}</div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(item.id); setFormData({...item}); }} className="text-slate-400 hover:text-indigo-600 transition-colors"><IconCreate className="w-5 h-5"/></button>
                  <button onClick={(e) => handleDelete(item.id, e)} className="text-slate-400 hover:text-red-500 transition-colors"><IconTrash className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-600 mb-2 truncate">{item.subject}</div>
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-slate-500 h-24 overflow-hidden leading-relaxed whitespace-pre-wrap">{item.body}</div>
            </div>
          ))}
        </div>

        {editingId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-slate-700">テンプレート編集</h3>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><IconClose className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                 <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">テンプレート名</label>
                      <input className={darkInput} placeholder="管理用タイトル" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">件名</label>
                      <input className={darkInput} placeholder="件名" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">本文</label>
                      <textarea className={`${darkInput} h-64 font-mono resize-none`} placeholder="本文" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center"><h4 className="font-bold text-slate-700">デフォルト宛先</h4><Button size="sm" onClick={() => { setPickerTab('CONTACTS'); setIsRecipientModalOpen(true); }} variant="secondary"><IconAdd className="w-3 h-3"/> 追加</Button></div>
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex-1 overflow-auto">
                      {formData.defaultRecipients.length === 0 && <div className="text-center text-slate-400 text-sm mt-10">宛先なし</div>}
                      {formData.defaultRecipients.map((r, i) => {
                         const addr = addresses.find(a => a.id === r.addressId);
                         return (
                           <div key={i} className="bg-white p-2 mb-2 rounded border border-slate-200 shadow-sm flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <div className="flex flex-col">
                                 <button onClick={() => moveRecipient(i, 'up')} disabled={i === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><IconArrowUp className="w-3 h-3"/></button>
                                 <button onClick={() => moveRecipient(i, 'down')} disabled={i === formData.defaultRecipients.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><IconArrowDown className="w-3 h-3"/></button>
                               </div>
                               <span className="font-medium text-sm text-slate-700">{addr?.name || '不明なユーザー'}</span>
                             </div>
                             <div className="flex gap-2">
                               <select 
                                  value={r.type} 
                                  onChange={e => {
                                    const newR = [...formData.defaultRecipients];
                                    newR[i].type = e.target.value as RecipientType;
                                    setFormData({...formData, defaultRecipients: newR});
                                  }} 
                                  className={`text-xs border rounded py-1 px-2 font-bold focus:outline-none ${recipientTypeStyles[r.type]}`}
                               >
                                 <option value="TO">TO</option><option value="CC">CC</option><option value="BCC">BCC</option>
                               </select>
                               <button onClick={() => setFormData({...formData, defaultRecipients: formData.defaultRecipients.filter((_, idx) => idx !== i)})} className="text-slate-400 hover:text-red-500"><IconClose className="w-4 h-4"/></button>
                             </div>
                           </div>
                         )
                      })}
                    </div>
                 </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <Button variant="secondary" onClick={() => setEditingId(null)}>キャンセル</Button>
                <Button onClick={handleSave}>保存</Button>
              </div>
            </div>
          </div>
        )}

        {isRecipientModalOpen && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  <button className="px-5 hover:bg-red-50 hover:text-red-500 transition-colors border-l border-slate-200 text-slate-400" onClick={()=>setIsRecipientModalOpen(false)}>
                    <IconClose className="w-5 h-5"/>
                  </button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-white">
                   <input className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 w-full p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="検索..." value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)} />
                </div>
                
                <div className="overflow-auto p-4 flex-1 bg-white">
                   {pickerTab === 'CONTACTS' ? (
                      <div className="space-y-2">
                      {addresses.filter(a => a.name.includes(recipientSearch) || a.email.includes(recipientSearch)).map(a => {
                        const isSelected = formData.defaultRecipients.some(r => r.addressId === a.id);
                        return (
                          <div 
                            key={a.id} 
                            onClick={() => { if(!isSelected) addRecipient(a.id); }} 
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
                      {groups.filter(g => g.group_name.includes(recipientSearch)).map(g => (
                        <div 
                          key={g.id} 
                          className="p-4 border border-slate-200 rounded-lg bg-white flex justify-between items-center hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
                           <div>
                             <div className="font-bold text-slate-800">{g.group_name}</div>
                             <div className="text-xs text-slate-500">{g.memberIds.length}名のメンバー</div>
                           </div>
                           <Button size="sm" variant="secondary" onClick={() => addGroupRecipients(g)}>
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
      </div>{}
    </div>
  );
};

