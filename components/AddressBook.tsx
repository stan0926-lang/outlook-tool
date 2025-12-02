import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import { fetchAddresses, saveAddress, deleteAddress } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconSearch, IconAdd, IconCreate, IconTrash, IconClose, IconCheck, IconPeople, IconArrowUp, IconArrowDown, IconChevronDown } from './ui/Icons';

type SortField = 'name' | 'organization' | 'department' | 'email';
type SortDirection = 'asc' | 'desc' | null;

export const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [search, setSearch] = useState('');
  
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const [filterOrganization, setFilterOrganization] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Address>({ id: '', name: '', email: '', organization: '', department: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<Address>({ id: '', name: '', email: '', organization: '自社', department: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchAddresses();
    setAddresses([...data]);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email) {
      alert('氏名とメールアドレスを入力してください。');
      return;
    }
    try {
      await saveAddress(createFormData);
      setIsCreateModalOpen(false);
      setCreateFormData({ id: '', name: '', email: '', organization: '自社', department: '' });
      await loadData();
    } catch (error: any) {
      alert(`追加失敗: ${error.message || 'Unknown error'}`);
      console.error('Error creating address:', error);
    }
  };

  const handleUpdateSave = async () => {
    if (!formData.name || !formData.email) {
      alert('氏名とメールアドレスを入力してください。');
      return;
    }
    try {
      await saveAddress(formData);
      setEditingId(null);
      await loadData();
    } catch (error: any) {
      alert(`更新失敗: ${error.message || 'Unknown error'}`);
      console.error('Error updating address:', error);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (window.confirm('削除しますか？')) {
      try {
        await deleteAddress(id);
        await loadData();
      } catch (error: any) {
        alert(`削除失敗: ${error.message || 'Unknown error'}`);
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getUniqueValues = (field: keyof Address) => {
    const values = addresses.map(a => a[field]).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  let filtered = addresses.filter(a => 
    (a.name.includes(search) || 
    a.email.includes(search) || 
    a.organization.includes(search) ||
    a.department.includes(search)) &&
    (!filterOrganization || a.organization === filterOrganization) &&
    (!filterDepartment || a.department === filterDepartment)
  );

  if (sortField && sortDirection) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortField]?.toLowerCase() || '';
      const bVal = b[sortField]?.toLowerCase() || '';
      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  const inputStyle = "w-full border border-slate-600 rounded p-1.5 bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-120px)]">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <IconPeople className="w-5 h-5 text-blue-600" />
            アドレス帳
          </h2>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
             <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input
              type="text"
              placeholder="検索..."
              className="border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-full md:w-64 bg-slate-700 text-white placeholder-slate-400 border-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(filterOrganization || filterDepartment || sortField) && (
            <button
              onClick={() => {
                setFilterOrganization('');
                setFilterDepartment('');
                setSortField(null);
                setSortDirection(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
              title="フィルター・ソートをクリア"
            >
              <IconClose className="w-3.5 h-3.5" />
              <span className="hidden md:inline">クリア</span>
            </button>
          )}
          <Button onClick={() => {
            setCreateFormData({ id: '', name: '', email: '', organization: '自社', department: '' });
            setIsCreateModalOpen(true);
          }} size="sm" className="flex items-center gap-1 shrink-0">
            <IconAdd className="w-4 h-4" /> 新規追加
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 shadow-sm z-10">
            <tr className="border-b border-slate-200 text-slate-700 font-semibold text-xs tracking-wider">
              <th className="text-left py-3 px-4">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                >
                  <span>氏名</span>
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? 
                      <IconArrowUp className="w-3.5 h-3.5 text-blue-600" /> : 
                      <IconArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  {sortField !== 'name' && (
                    <IconArrowUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSort('organization')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                  >
                    <span>所属</span>
                    {sortField === 'organization' && (
                      sortDirection === 'asc' ? 
                        <IconArrowUp className="w-3.5 h-3.5 text-blue-600" /> : 
                        <IconArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {sortField !== 'organization' && (
                      <IconArrowUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenFilter(openFilter === 'organization' ? null : 'organization')}
                      className={`p-1 rounded hover:bg-slate-200 transition-colors ${filterOrganization ? 'text-blue-600' : 'text-slate-400'}`}
                      title="フィルター"
                    >
                      <IconChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {openFilter === 'organization' && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 min-w-[180px] max-h-[240px] overflow-auto z-50">
                        <button
                          onClick={() => { setFilterOrganization(''); setOpenFilter(null); }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 transition-colors ${!filterOrganization ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600'}`}
                        >
                          すべて
                        </button>
                        {getUniqueValues('organization').map(org => (
                          <button
                            key={org}
                            onClick={() => { setFilterOrganization(org); setOpenFilter(null); }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 transition-colors ${filterOrganization === org ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600'}`}
                          >
                            {org}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="text-left py-3 px-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                  >
                    <span>部署</span>
                    {sortField === 'department' && (
                      sortDirection === 'asc' ? 
                        <IconArrowUp className="w-3.5 h-3.5 text-blue-600" /> : 
                        <IconArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {sortField !== 'department' && (
                      <IconArrowUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenFilter(openFilter === 'department' ? null : 'department')}
                      className={`p-1 rounded hover:bg-slate-200 transition-colors ${filterDepartment ? 'text-blue-600' : 'text-slate-400'}`}
                      title="フィルター"
                    >
                      <IconChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {openFilter === 'department' && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 min-w-[180px] max-h-[240px] overflow-auto z-50">
                        <button
                          onClick={() => { setFilterDepartment(''); setOpenFilter(null); }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 transition-colors ${!filterDepartment ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600'}`}
                        >
                          すべて
                        </button>
                        {getUniqueValues('department').map(dept => (
                          <button
                            key={dept}
                            onClick={() => { setFilterDepartment(dept); setOpenFilter(null); }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 transition-colors ${filterDepartment === dept ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600'}`}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="text-left py-3 px-4">
                <button 
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                >
                  <span>Email</span>
                  {sortField === 'email' && (
                    sortDirection === 'asc' ? 
                      <IconArrowUp className="w-3.5 h-3.5 text-blue-600" /> : 
                      <IconArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  {sortField !== 'email' && (
                    <IconArrowUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />
                  )}
                </button>
              </th>
              <th className="text-right py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(addr => (
              <tr key={addr.id} className="hover:bg-slate-50 transition-colors">
                {editingId === addr.id ? (
                  <>
                    <td className="p-3"><input className={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></td>
                    <td className="p-3"><input className={inputStyle} value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} /></td>
                    <td className="p-3"><input className={inputStyle} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></td>
                    <td className="p-3"><input className={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button size="sm" onClick={handleUpdateSave} className="mr-1"><IconCheck className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><IconClose className="w-4 h-4" /></Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium text-slate-900">{addr.name}</td>
                    <td className="p-4 text-slate-600">{addr.organization}</td>
                    <td className="p-4 text-slate-600">{addr.department}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{addr.email}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button onClick={() => { setEditingId(addr.id); setFormData({...addr}); }} className="text-slate-400 hover:text-blue-600 mr-3 transition-colors" title="編集"><IconCreate className="w-5 h-5" /></button>
                      <button onClick={(e) => handleDelete(addr.id, e)} className="text-slate-400 hover:text-red-500 transition-colors" title="削除"><IconTrash className="w-5 h-5" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
            <h3 className="font-bold text-lg text-slate-800 mb-4">新規連絡先</h3>
            <form onSubmit={handleCreateSave} className="flex flex-col gap-4" noValidate>
              <input required className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="氏名" value={createFormData.name} onChange={e => setCreateFormData({...createFormData, name: e.target.value})} />
              <input required className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} />
              <input className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="所属 (例: 自社)" value={createFormData.organization} onChange={e => setCreateFormData({...createFormData, organization: e.target.value})} />
              <input className="border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="部署 (例: 営業部)" value={createFormData.department} onChange={e => setCreateFormData({...createFormData, department: e.target.value})} />
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>キャンセル</Button>
                <Button type="submit">作成</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};