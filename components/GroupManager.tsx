
import React, { useState, useEffect } from 'react';
import { Group, Address, AttributeDefinition } from '../types';
import { fetchGroups, saveGroup, deleteGroup, fetchAddresses, fetchAttrDefs } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconAdd, IconCreate, IconTrash, IconClose, IconFolderOpen, IconSearch, IconCheck, IconMenu, IconArrowUp, IconArrowDown } from './ui/Icons';

interface GroupManagerProps {
  isActive?: boolean;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ isActive = true }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [attrDefs, setAttrDefs] = useState<AttributeDefinition[]>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  // Attributes State
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [isAttrPickerOpen, setIsAttrPickerOpen] = useState(false);

  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive]);

  const loadData = async () => {
    const [gData, aData, adData] = await Promise.all([fetchGroups(), fetchAddresses(), fetchAttrDefs()]);
    setGroups([...gData]);
    setAllAddresses([...aData]);
    setAttrDefs([...adData]);
    if (selectedGroup) {
      const fresh = gData.find(g => g.id === selectedGroup.id);
      setSelectedGroup(fresh || null);
    }
  };

  const submitCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroup: Group = { id: '', group_name: newGroupName, memberIds: [], customAttributes: [] };
    await saveGroup(newGroup);
    await loadData();
    setIsCreateGroupModalOpen(false);
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm("グループを削除しますか？")) {
      await deleteGroup(id);
      setSelectedGroup(null);
      await loadData();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return;
    const newMembers = selectedGroup.memberIds.filter(m => m.id !== memberId);
    const updated = { ...selectedGroup, memberIds: newMembers };
    await saveGroup(updated);
    await loadData();
  };

  const handleAddMember = async (addressId: string, recipientType: 'to' | 'cc' | 'bcc' = 'to') => {
    if (!selectedGroup || selectedGroup.memberIds.some(m => m.id === addressId)) return;
    const maxOrder = selectedGroup.memberIds.length > 0 
      ? Math.max(...selectedGroup.memberIds.map(m => m.order)) 
      : -1;
    const newMember = { id: addressId, recipientType, order: maxOrder + 1 };
    const updated = { ...selectedGroup, memberIds: [...selectedGroup.memberIds, newMember] };
    await saveGroup(updated);
    await loadData();
  };

  const handleUpdateRecipientType = async (memberId: string, newType: 'to' | 'cc' | 'bcc') => {
    if (!selectedGroup) return;
    const updatedMembers = selectedGroup.memberIds.map(m => 
      m.id === memberId ? { ...m, recipientType: newType } : m
    );
    const updated = { ...selectedGroup, memberIds: updatedMembers };
    await saveGroup(updated);
    await loadData();
  };

  const handleMoveUp = async (memberId: string) => {
    if (!selectedGroup) return;
    const members = [...selectedGroup.memberIds].sort((a, b) => a.order - b.order);
    const idx = members.findIndex(m => m.id === memberId);
    if (idx <= 0) return;
    
    [members[idx].order, members[idx - 1].order] = [members[idx - 1].order, members[idx].order];
    const updated = { ...selectedGroup, memberIds: members };
    await saveGroup(updated);
    await loadData();
  };

  const handleMoveDown = async (memberId: string) => {
    if (!selectedGroup) return;
    const members = [...selectedGroup.memberIds].sort((a, b) => a.order - b.order);
    const idx = members.findIndex(m => m.id === memberId);
    if (idx < 0 || idx >= members.length - 1) return;
    
    [members[idx].order, members[idx + 1].order] = [members[idx + 1].order, members[idx].order];
    const updated = { ...selectedGroup, memberIds: members };
    await saveGroup(updated);
    await loadData();
  };

  const saveName = async () => {
    if (selectedGroup && editName) {
      const updated = { ...selectedGroup, group_name: editName };
      await saveGroup(updated);
      setIsEditingName(false);
      await loadData();
    }
  };

  // Attribute Handlers
  const handleAddAttribute = async () => {
      if(!selectedGroup || !newAttrKey || !newAttrValue) return;
      const currentAttrs = selectedGroup.customAttributes || [];
      // Remove existing key if present to overwrite
      const filtered = currentAttrs.filter(a => a.key !== newAttrKey);
      const updatedAttrs = [...filtered, { key: newAttrKey, value: newAttrValue }];
      
      const updatedGroup = { ...selectedGroup, customAttributes: updatedAttrs };
      await saveGroup(updatedGroup);
      setNewAttrKey('');
      setNewAttrValue('');
      await loadData();
  };

  const handleDeleteAttribute = async (key: string) => {
      if(!selectedGroup) return;
      const currentAttrs = selectedGroup.customAttributes || [];
      const updatedAttrs = currentAttrs.filter(a => a.key !== key);
      const updatedGroup = { ...selectedGroup, customAttributes: updatedAttrs };
      await saveGroup(updatedGroup);
      await loadData();
  };

  
  const currentGroupMembers = selectedGroup 
    ? selectedGroup.memberIds
        .map(m => ({ ...m, address: allAddresses.find(a => a.id === m.id) }))
        .filter(m => m.address)
        .sort((a, b) => a.order - b.order)
    : [];

  const availableForGroup = selectedGroup
    ? allAddresses.filter(a => !selectedGroup.memberIds.some(m => m.id === a.id) && (
        a.name.includes(memberSearch) || a.organization.includes(memberSearch)
      ))
    : [];

  const inputStyle = "w-full border border-slate-600 rounded p-1.5 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex gap-6 items-start flex-col md:flex-row h-full">
          <div className="w-full md:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <IconFolderOpen className="w-5 h-5 text-blue-600"/> グループ一覧
              </h3>
              <Button size="sm" onClick={() => { setNewGroupName(''); setIsCreateGroupModalOpen(true); }}><IconAdd className="w-4 h-4"/> 作成</Button>
            </div>
            <div className="p-3 overflow-auto flex-1">
              {groups.map(group => {
                const validMemberCount = group.memberIds.filter(m => 
                  allAddresses.some(a => a.id === m.id)
                ).length;
                return (
                  <div 
                    key={group.id}
                    onClick={() => { setSelectedGroup(group); setIsEditingName(false); }}
                    className={`p-3 rounded-lg cursor-pointer mb-2 border transition-all font-medium ${
                      selectedGroup?.id === group.id 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {group.group_name} <span className="text-slate-400 text-xs ml-2">({validMemberCount})</span>
                  </div>
                );
              })}
              {groups.length === 0 && <div className="text-center text-slate-400 text-sm mt-4">グループがありません</div>}
            </div>
          </div>

          <div className="flex-1 w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden">
            {selectedGroup ? (
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  {isEditingName ? (
                     <div className="flex gap-2 w-full max-w-sm">
                       <input autoFocus className={inputStyle} value={editName} onChange={e => setEditName(e.target.value)}/>
                       <Button size="sm" onClick={saveName}><IconCheck className="w-4 h-4"/></Button>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                       <h2 className="text-xl font-bold text-slate-800">{selectedGroup.group_name}</h2>
                       <button onClick={() => { setEditName(selectedGroup.group_name); setIsEditingName(true); }} className="text-slate-400 hover:text-blue-600"><IconCreate className="w-4 h-4"/></button>
                     </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => handleDeleteGroup(selectedGroup.id)}><IconTrash className="w-4 h-4"/></Button>
                  </div>
                </div>

                {/* Group Variables Section */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><IconCreate className="w-4 h-4 text-blue-600"/> グループ変数設定 (現場名など)</h4>
                    
                    <div className="flex gap-2 mb-3 items-center">
                        <div className="w-1/3 min-w-[150px]">
                           {newAttrKey ? (
                               <div 
                                 onClick={() => setIsAttrPickerOpen(true)}
                                 className="border border-blue-300 bg-blue-50 text-blue-800 rounded px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 flex justify-between items-center"
                               >
                                  <span className="font-bold">{`{${newAttrKey}}`}</span>
                                  <IconMenu className="w-3 h-3 opacity-50"/>
                               </div>
                           ) : (
                               <button 
                                 onClick={() => setIsAttrPickerOpen(true)}
                                 className="w-full border border-dashed border-slate-400 text-slate-500 rounded px-3 py-2 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-between items-center"
                               >
                                  <span>変数を選択...</span>
                                  <IconSearch className="w-3 h-3"/>
                               </button>
                           )}
                        </div>
                        
                        <input className="border border-slate-300 rounded px-2 py-2 text-sm flex-1 bg-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="値 (例: 東京ビル)" value={newAttrValue} onChange={e => setNewAttrValue(e.target.value)} />
                        <Button size="sm" onClick={handleAddAttribute} disabled={!newAttrKey || !newAttrValue}><IconAdd className="w-3 h-3"/> 追加</Button>
                    </div>

                    {(!selectedGroup.customAttributes || selectedGroup.customAttributes.length === 0) && <p className="text-xs text-slate-400">変数は設定されていません</p>}
                    
                    <div className="flex flex-wrap gap-2">
                        {selectedGroup.customAttributes?.map((attr, idx) => (
                            <div key={idx} className="bg-white border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-2 shadow-sm">
                                <span className="font-bold">{`{${attr.key}}`}</span>: <span className="font-mono text-slate-600">{attr.value}</span>
                                <button onClick={() => handleDeleteAttribute(attr.key)} className="text-blue-300 hover:text-red-500"><IconClose className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Member List */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-700">メンバーリスト（TO/CC/BCC設定・順序変更可能）</h4>
                        <Button onClick={() => setIsAddMemberModalOpen(true)} size="sm" variant="secondary"><IconAdd className="w-4 h-4"/> メンバー追加</Button>
                    </div>
                    <div className="space-y-2">
                    {currentGroupMembers.map((member, idx) => {
                      const typeStyles = {
                        to: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                        cc: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                        bcc: 'bg-pink-100 text-pink-700 border-pink-200'
                      };
                      return (
                        <div key={member.id} className="border border-slate-200 rounded-lg p-3 bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => handleMoveUp(member.id)} 
                                disabled={idx === 0}
                                className="text-slate-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="上へ移動"
                            >
                                <IconArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleMoveDown(member.id)} 
                                disabled={idx === currentGroupMembers.length - 1}
                                className="text-slate-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="下へ移動"
                            >
                                <IconArrowDown className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mr-2">
                          <select 
                              value={member.recipientType} 
                              onChange={(e) => handleUpdateRecipientType(member.id, e.target.value as 'to' | 'cc' | 'bcc')}
                              className={`text-xs border rounded py-1 px-1 cursor-pointer focus:ring-1 focus:ring-indigo-200 outline-none font-bold ${typeStyles[member.recipientType]}`}
                          >
                              <option value="to">TO</option>
                              <option value="cc">CC</option>
                              <option value="bcc">BCC</option>
                          </select>
                        </div>
                        <div className="mr-auto min-w-0">
                            <div className="font-bold text-sm text-slate-800 truncate">{member.address?.name}</div>
                            <div className="text-xs text-slate-600 font-semibold truncate ml-3">{member.address?.organization}{member.address?.department ? ` / ${member.address.department}` : ''}</div>
                        </div>
                        <button onClick={() => handleRemoveMember(member.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><IconClose className="w-4 h-4"/></button>
                        </div>
                      );
                    })}
                    {currentGroupMembers.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                        メンバーがいません。追加してください。
                        </div>
                    )}
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <IconFolderOpen className="w-12 h-12 mb-2 opacity-50"/>
                <p>グループを選択してください</p>
              </div>
            )}
          </div>
      </div>

      {/* Modals */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
           <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 w-full max-w-sm">
             <h3 className="font-bold text-slate-800 mb-4">グループ作成</h3>
             <input autoFocus className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg w-full p-2.5 mb-6 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="グループ名" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
             <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsCreateGroupModalOpen(false)}>キャンセル</Button><Button onClick={submitCreateGroup}>作成</Button></div>
           </div>
        </div>
      )}

      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
           <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 w-full max-w-lg">
             <div className="flex justify-between mb-4"><h3 className="font-bold text-slate-800">メンバー追加</h3><button onClick={() => setIsAddMemberModalOpen(false)}><IconClose className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button></div>
             <input className="border border-slate-300 bg-white text-slate-800 placeholder-slate-400 rounded-lg w-full p-2.5 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="検索..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
             <div className="max-h-[300px] overflow-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
               {availableForGroup.map(a => (
                 <div key={a.id} className="p-3 hover:bg-slate-50 flex justify-between items-center group">
                   <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-800 truncate">{a.name}</div>
                      <div className="text-xs text-slate-600 font-semibold truncate ml-3">{a.organization}{a.department ? ` / ${a.department}` : ''}</div>
                   </div>
                   <div className="flex gap-2 ml-3">
                     <button onClick={() => { handleAddMember(a.id, 'to'); setIsAddMemberModalOpen(false); }} className="px-3 py-1.5 text-xs font-bold bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">TO</button>
                     <button onClick={() => { handleAddMember(a.id, 'cc'); setIsAddMemberModalOpen(false); }} className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">CC</button>
                     <button onClick={() => { handleAddMember(a.id, 'bcc'); setIsAddMemberModalOpen(false); }} className="px-3 py-1.5 text-xs font-bold bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">BCC</button>
                   </div>
                 </div>
               ))}
               {availableForGroup.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">候補がいません</div>}
             </div>
           </div>
        </div>
      )}

      {isAttrPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-slate-700">変数を選択</h3>
                    <button onClick={() => setIsAttrPickerOpen(false)}><IconClose className="w-5 h-5 text-slate-400"/></button>
                </div>
                <div className="p-6 overflow-auto bg-slate-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {attrDefs.map(def => (
                            <div 
                                key={def.id} 
                                onClick={() => {
                                    setNewAttrKey(def.key);
                                    setIsAttrPickerOpen(false);
                                }}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <IconCreate className="w-5 h-5"/>
                                </div>
                                <div className="font-bold text-slate-800 mb-1">{def.key}</div>
                                <div className="text-xs text-slate-500">{def.label || '説明なし'}</div>
                            </div>
                        ))}
                    </div>
                    {attrDefs.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            定義された変数がありません。<br/>
                            「変数設定」メニューから追加してください。
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};