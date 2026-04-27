// @ts-nocheck
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { Card } from '@/components';
import { CLASSES } from '@/constants/classes';
import { useSaveSettings, useSettingsBookkeeper } from '@/hooks/query';
import PreferencesPageLoader from '../PreferencesPageLoader';

const AIBookkeeperFormContext = createContext();

function AIBookkeeperFormProvider({ ...props }) {
  const { isLoading: isBookkeeperSettingsLoading } = useSettingsBookkeeper();
  const { mutateAsync: saveSettingMutate } = useSaveSettings();

  const provider = {
    saveSettingMutate,
  };

  return (
    <div
      className={classNames(
        CLASSES.PREFERENCES_PAGE_INSIDE_CONTENT,
        CLASSES.PREFERENCES_PAGE_INSIDE_CONTENT_ACCOUNTANT,
      )}
    >
      <AIBookkeeperCard>
        {isBookkeeperSettingsLoading ? (
          <PreferencesPageLoader />
        ) : (
          <AIBookkeeperFormContext.Provider value={provider} {...props} />
        )}
      </AIBookkeeperCard>
    </div>
  );
}

const useAIBookkeeperFormContext = () => useContext(AIBookkeeperFormContext);

export { AIBookkeeperFormProvider, useAIBookkeeperFormContext };

const AIBookkeeperCard = styled(Card)`
  padding: 25px;
`;
