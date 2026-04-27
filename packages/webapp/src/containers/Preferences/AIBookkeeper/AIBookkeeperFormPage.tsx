// @ts-nocheck
import React, { useEffect } from 'react';
import * as R from 'ramda';
import { Formik } from 'formik';
import { Intent } from '@blueprintjs/core';
import { flatten, unflatten } from 'flat';

import { AppToaster } from '@/components';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { withSettings } from '@/containers/Settings/withSettings';
import { compose, transformToForm, transfromToSnakeCase } from '@/utils';
import { transferObjectOptionsToArray } from '../Accountant/utils';
import { useAIBookkeeperFormContext } from './AIBookkeeperFormProvider';
import { AIBookkeeperSchema } from './AIBookkeeper.schema';
import AIBookkeeperForm from './AIBookkeeperForm';

const defaultFormValues = flatten({
  bookkeeper: {
    enabled: true,
    autoMode: false,
    classifyAllTransactions: true,
    interviewEnabled: true,
    chatEnabled: true,
    bulkClassificationEnabled: true,
    classificationMode: 'batch',
    autoCreateRules: true,
    autoCreateExpenseAccounts: true,
    amazonParserEnabled: false,
    taxToolsEnabled: false,
    autoPostThreshold: 0.92,
    reviewThreshold: 0.8,
    requireReviewAmount: 500,
    deductionPosture: 'standard',
    greyAreaCategories: 'auto, meals, travel, owner expenses',
    monthlyAutoExpenseTarget: '',
    annualAutoExpenseTarget: '',
    interviewContext: '',
  },
});

function AIBookkeeperFormPage({ changePreferencesPageTitle, allSettings }) {
  const { saveSettingMutate } = useAIBookkeeperFormContext();

  useEffect(() => {
    changePreferencesPageTitle('AI Bookkeeper');
  }, [changePreferencesPageTitle]);

  const initialValues = unflatten({
    ...defaultFormValues,
    ...transformToForm(flatten(allSettings), defaultFormValues),
  });

  const handleFormSubmit = (values, { setSubmitting }) => {
    const options = R.compose(
      transferObjectOptionsToArray,
      transfromToSnakeCase,
    )(values);
    setSubmitting(true);

    const onSuccess = () => {
      AppToaster.show({
        message: 'AI bookkeeper settings saved',
        intent: Intent.SUCCESS,
      });
      setSubmitting(false);
    };
    const onError = () => {
      setSubmitting(false);
    };

    saveSettingMutate({ options }).then(onSuccess).catch(onError);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={AIBookkeeperSchema}
      onSubmit={handleFormSubmit}
      component={AIBookkeeperForm}
    />
  );
}

export default compose(
  withSettings(({ allSettings }) => ({
    allSettings,
  })),
  withDashboardActions,
)(AIBookkeeperFormPage);
