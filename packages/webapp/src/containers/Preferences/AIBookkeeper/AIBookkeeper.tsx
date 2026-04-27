// @ts-nocheck
import React from 'react';
import { AIBookkeeperFormProvider } from './AIBookkeeperFormProvider';
import AIBookkeeperFormPage from './AIBookkeeperFormPage';

export default function AIBookkeeperPreferences() {
  return (
    <AIBookkeeperFormProvider>
      <AIBookkeeperFormPage />
    </AIBookkeeperFormProvider>
  );
}
