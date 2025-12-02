
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { MailComposer } from './components/MailComposer';
import { AddressBook } from './components/AddressBook';
import { GroupManager } from './components/GroupManager';
import { TemplateManager } from './components/TemplateManager';
import { VariableSettings } from './components/VariableSettings';
import { DataImport } from './components/DataImport';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.COMPOSE);

  const renderView = () => {
    switch (currentView) {
      case View.COMPOSE:
        return <MailComposer />;
      case View.ADDRESS_BOOK:
        return <AddressBook />;
      case View.GROUPS:
        return <GroupManager isActive={currentView === View.GROUPS} />;
      case View.TEMPLATES:
        return <TemplateManager />;
      case View.VARIABLES:
        return <VariableSettings />;
      case View.IMPORT:
        return <DataImport />;
      default:
        return <MailComposer />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
