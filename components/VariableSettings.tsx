
import React, { useState, useEffect } from 'react';
import { GlobalVariable, AttributeDefinition } from '../types';
import { fetchGlobals, saveGlobal, deleteGlobal, fetchAttrDefs, saveAttrDef, deleteAttrDef } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconCreate, IconTrash, IconAdd, IconCheck } from './ui/Icons';

export const VariableSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'GROUP_DEF'>('GLOBAL');
  
  // Global Vars State
  const [globals, setGlobals] = useState<GlobalVariable[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Group Defs State
  const [attrDefs, setAttrDefs] = useState<AttributeDefinition[]>([]);
  const [newDefKey, setNewDefKey] = useState('');
  const [newDefLabel, setNewDefLabel] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [g, a] = await Promise.all([fetchGlobals(), fetchAttrDefs()]);
    setGlobals(g);
    setAttrDefs(a);
  };

  // Globals Handlers
  const handleAddGlobal = async () => {
    if (!newKey || !newValue) return;
    await saveGlobal({ id: '', key: newKey, value: newValue });
    setNewKey('');
    setNewValue('');
    loadData();
  };
  const handleDeleteGlobal = async (id: string) => {
    if (window.confirm('この変数を削除しますか？')) {
      await deleteGlobal(id);
      loadData();
    }
  };

  // Attr Defs Handlers
  const handleAddDef = async () => {
      if (!newDefKey) return;
      await saveAttrDef({ id: '', key: newDefKey, label: newDefLabel });
      setNewDefKey('');
      setNewDefLabel('');
      loadData();
  };
  const handleDeleteDef = async (id: string) => {
      if (window.confirm('この定義を削除しますか？')) {
          await deleteAttrDef(id);
          loadData();
      }
  };

  const inputStyle = "flex-1 border border-slate-600 rounded p-2 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 pb-0 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <IconCreate className="w-5 h-5 text-blue-600" />
          変数設定
        </h2>
        <div className="flex gap-1">
             <button 
                onClick={() => setActiveTab('GLOBAL')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                    activeTab === 'GLOBAL' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
             >
                共通定数 (グローバル)
             </button>
             <button 
                onClick={() => setActiveTab('GROUP_DEF')}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                    activeTab === 'GROUP_DEF' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
             >
                グループ変数定義
             </button>
        </div>
      </div>

      <div className="p-6 flex-1 bg-white flex flex-col gap-6 overflow-auto min-h-0">
        
        {activeTab === 'GLOBAL' && (
            <div className="flex flex-col gap-6 animate-fade-in">
                <p className="text-sm text-slate-500">
                    全てのメールで共通して使える変数を設定します。<br/>
                    例: <code>{`{メール送付者名}`}</code> → 「山田太郎」
                </p>

                <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">変数名 (キー)</label>
                        <input className={inputStyle} placeholder="例: メール送付者名" value={newKey} onChange={e => setNewKey(e.target.value)} />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">置換する値</label>
                        <input className={inputStyle} placeholder="例: 山田" value={newValue} onChange={e => setNewValue(e.target.value)} />
                    </div>
                    <Button onClick={handleAddGlobal} className="flex gap-2 items-center whitespace-nowrap"><IconAdd className="w-4 h-4"/> 追加</Button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="text-slate-500 border-b border-slate-200">
                                <th className="p-3 text-left w-1/3">変数名 (キー)</th>
                                <th className="p-3 text-left">置換後の値</th>
                                <th className="p-3 text-right w-20">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {globals.map(g => (
                                <tr key={g.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-slate-700 font-bold">{`{${g.key}}`}</td>
                                    <td className="p-3 text-slate-600">{g.value}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => handleDeleteGlobal(g.id)} className="text-slate-400 hover:text-red-500">
                                            <IconTrash className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {globals.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400">変数が設定されていません</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'GROUP_DEF' && (
            <div className="flex flex-col gap-6 animate-fade-in">
                <p className="text-sm text-slate-500">
                    グループごとに設定する項目のマスタ（候補）を管理します。<br/>
                    ここで登録した項目は、グループ管理画面でプルダウン選択できるようになります。
                </p>

                <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">変数名 (キー)</label>
                        <input className={inputStyle} placeholder="例: 現場名" value={newDefKey} onChange={e => setNewDefKey(e.target.value)} />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">説明 (ラベル)</label>
                        <input className={inputStyle} placeholder="例: プロジェクトの名称" value={newDefLabel} onChange={e => setNewDefLabel(e.target.value)} />
                    </div>
                    <Button onClick={handleAddDef} className="flex gap-2 items-center whitespace-nowrap"><IconAdd className="w-4 h-4"/> 追加</Button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="text-slate-500 border-b border-slate-200">
                                <th className="p-3 text-left w-1/3">変数名 (キー)</th>
                                <th className="p-3 text-left">説明</th>
                                <th className="p-3 text-right w-20">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attrDefs.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-slate-700 font-bold">{`{${d.key}}`}</td>
                                    <td className="p-3 text-slate-600">{d.label}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => handleDeleteDef(d.id)} className="text-slate-400 hover:text-red-500">
                                            <IconTrash className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {attrDefs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400">定義がありません</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
