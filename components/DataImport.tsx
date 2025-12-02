import React, { useState } from 'react';
import { bulkCreateAddresses } from '../services/mockApi';
import { Button } from './ui/Button';
import { IconDownload } from './ui/Icons';

export const DataImport: React.FC = () => {
  const [inputText, setInputText] = useState('');
  
  const loadDemoData = () => {
    const demoData = `佐々木 一郎,sasaki@demo-kensetsu.co.jp,デモ建設株式会社,工事部
高田 美咲,takada@partner-corp.jp,協力会社パートナー,施工管理部`;
    setInputText(demoData);
  };
  
  const handleImport = async () => {
    // Simple line-based parser that splits by tab or comma
    const lines = inputText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      alert("データがありません");
      return;
    }

    const newAddrs = [];
    
    for (let line of lines) {
      // Handle both tab and comma
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split(',');
      
      // Clean quotes
      parts = parts.map(p => p.trim().replace(/^"|"$/g, ''));

      // Very basic validation: Must have at least 2 columns, and one must look like email
      if (parts.length >= 2) {
         // Heuristic: Check if part[0] or part[1] is email
         let name = parts[0];
         let email = parts[1];
         let org = parts[2] || '自社';
         let dept = parts[3] || '';

         if (name.includes('@')) {
           // Swap if email is first
           [name, email] = [email, name];
         }
         
         // Header check
         if (email.includes('@') && !email.toLowerCase().includes('email')) {
            newAddrs.push({
              id: '',
              name: name,
              email: email,
              organization: org,
              department: dept
            });
         }
      }
    }

    if (newAddrs.length > 0) {
      if (window.confirm(`${newAddrs.length}件のデータをインポートしますか？`)) {
        await bulkCreateAddresses(newAddrs);
        alert('完了しました');
        setInputText('');
      }
    } else {
      alert('有効なデータが見つかりませんでした。形式を確認してください。\n例: 氏名, Email, 組織, 部署');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <IconDownload className="w-5 h-5 text-blue-600"/> データ一括登録
        </h2>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-4 bg-white">
        <div className="flex justify-between items-start">
          <p className="text-sm text-slate-600">
            CSVの内容を以下に貼り付けてください。<br/>
            <span className="text-xs text-slate-400">推奨形式: 氏名,Email,組織,部署（カンマ区切り）</span>
          </p>
          <Button size="sm" variant="secondary" onClick={loadDemoData}>
            デモデータを読込
          </Button>
        </div>
        <textarea 
          className="flex-1 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-4 font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
          placeholder={`山田 太郎, yamada@example.com, 自社, 営業部\n鈴木 花子, suzuki@example.com, サンプル社, 開発部`}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <div className="flex justify-end pt-2">
          <Button size="lg" onClick={handleImport} className="shadow-md shadow-blue-100">インポート実行</Button>
        </div>
      </div>
    </div>
  );
};