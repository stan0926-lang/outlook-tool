
import { Address, Group, EmailTemplate, GlobalVariable, AttributeDefinition } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE = 'http://127.0.0.1:5000/api';

// ============================================================================
// HTTP API UTILITIES
// ============================================================================
const httpGet = async (path: string) => {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
};

const httpPost = async (path: string, body: any) => {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
};

const httpPut = async (path: string, body: any) => {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json().catch(() => ({}));
};

const httpDelete = async (path: string) => {
  const r = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json().catch(() => ({}));
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Addresses
export const fetchAddresses = async (): Promise<Address[]> => httpGet('/addresses');
export const saveAddress = async (item: Address): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/addresses/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/addresses', item);
};
export const deleteAddress = (id: string): Promise<any> => httpDelete(`/addresses/${id}`);
export const bulkCreateAddresses = (items: Address[]): Promise<any[]> => 
  Promise.all(items.map(i => httpPost('/addresses', i)));

// Groups
export const fetchGroups = async (): Promise<Group[]> => httpGet('/groups');
export const saveGroup = async (item: Group): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/groups/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/groups', item);
};
export const deleteGroup = (id: string): Promise<any> => httpDelete(`/groups/${id}`);

// Templates
export const fetchTemplates = async (): Promise<EmailTemplate[]> => httpGet('/templates');
export const saveTemplate = async (item: EmailTemplate): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/templates/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/templates', item);
};
export const deleteTemplate = (id: string): Promise<any> => httpDelete(`/templates/${id}`);

// Globals
export const fetchGlobals = async (): Promise<GlobalVariable[]> => httpGet('/globals');
export const saveGlobal = async (item: GlobalVariable): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/globals/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/globals', item);
};
export const deleteGlobal = (id: string): Promise<any> => httpDelete(`/globals/${id}`);

// Attribute Definitions
export const fetchAttrDefs = async (): Promise<AttributeDefinition[]> => httpGet('/attrdefs');
export const saveAttrDef = async (item: AttributeDefinition): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/attrdefs/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/attrdefs', item);
};
export const deleteAttrDef = (id: string): Promise<any> => httpDelete(`/attrdefs/${id}`);

// ============================================================================
// VARIABLE RESOLVER
// ============================================================================
export const resolveTextVariables = (
  text: string, 
  group?: Group, 
  globals?: GlobalVariable[]
): { text: string; html: string } => {
  let resolvedText = text;
  
  const replacer = (targetText: string, key: string, value: string) => {
      const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{${safeKey}\\}`, 'g');
      return targetText.replace(regex, value);
  };
  
  const highlighter = (targetHtml: string, key: string, value: string) => {
      const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{${safeKey}\\}`, 'g');
      const escapedValue = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return targetHtml.replace(regex, `<span style="color: #f97316; font-weight: bold;">${escapedValue}</span>`);
  };

  // システム変数: {本日} -> yyyymmdd形式の今日の日付
  const today = new Date();
  const todayStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
  resolvedText = replacer(resolvedText, '本日', todayStr);

  // Apply Globals
  if (globals) {
      globals.forEach(g => {
          resolvedText = replacer(resolvedText, g.key, g.value);
      });
  }

  // Apply Group Attributes
  if (group && group.customAttributes) {
      group.customAttributes.forEach(attr => {
          resolvedText = replacer(resolvedText, attr.key, attr.value);
      });
  }
  
  // Construct HTML version with highlighting
  let resolvedHtml = text.replace(/\n/g, '<br/>'); 
  
  // システム変数をハイライト表示
  resolvedHtml = highlighter(resolvedHtml, '本日', todayStr);
  
  if (globals) {
    globals.forEach(g => {
        resolvedHtml = highlighter(resolvedHtml, g.key, g.value);
    });
  }
  if (group && group.customAttributes) {
    group.customAttributes.forEach(attr => {
        resolvedHtml = highlighter(resolvedHtml, attr.key, attr.value);
    });
  }

  return { text: resolvedText, html: resolvedHtml };
};
