// @ts-nocheck
import React from 'react';
import { Form, useFormikContext } from 'formik';
import styled from 'styled-components';
import { Button, FormGroup, Intent, Radio } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';

import {
  CardFooterActions,
  FCheckbox,
  FFormGroup,
  FInputGroup,
  FRadioGroup,
  FSelect,
  FTextArea,
} from '@/components';

const ClassificationModes = [
  { key: 'batch', name: 'Batch' },
  { key: 'realtime', name: 'Realtime' },
  { key: 'hybrid', name: 'Hybrid' },
];

export default function AIBookkeeperForm() {
  const history = useHistory();
  const { isSubmitting } = useFormikContext();

  const handleCloseClick = () => {
    history.go(-1);
  };

  return (
    <Form>
      <SectionTitle>Automation</SectionTitle>
      <FormGroup>
        <FFormGroup name={'bookkeeper.enabled'} inline>
          <FCheckbox
            inline
            label={'Enable AI bookkeeper'}
            name={'bookkeeper.enabled'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.autoMode'} inline>
          <FCheckbox
            inline
            label={'Allow auto-mode for high-confidence transactions'}
            name={'bookkeeper.autoMode'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.classifyAllTransactions'} inline>
          <FCheckbox
            inline
            label={'Classify every Plaid transaction'}
            name={'bookkeeper.classifyAllTransactions'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.bulkClassificationEnabled'} inline>
          <FCheckbox
            inline
            label={'Use bulk classification for large imports'}
            name={'bookkeeper.bulkClassificationEnabled'}
          />
        </FFormGroup>
      </FormGroup>

      <SettingsGrid>
        <FFormGroup
          name={'bookkeeper.classificationMode'}
          label={'Classification mode'}
          fastField
        >
          <FSelect
            name={'bookkeeper.classificationMode'}
            items={ClassificationModes}
            valueAccessor={'key'}
            textAccessor={'name'}
            popoverProps={{ minimal: true }}
            fastField
          />
        </FFormGroup>
        <FFormGroup
          name={'bookkeeper.autoPostThreshold'}
          label={'Auto-post confidence'}
          fastField
        >
          <FInputGroup
            name={'bookkeeper.autoPostThreshold'}
            type={'number'}
            step={'0.01'}
            fastField
          />
        </FFormGroup>
        <FFormGroup
          name={'bookkeeper.reviewThreshold'}
          label={'Review confidence'}
          fastField
        >
          <FInputGroup
            name={'bookkeeper.reviewThreshold'}
            type={'number'}
            step={'0.01'}
            fastField
          />
        </FFormGroup>
        <FFormGroup
          name={'bookkeeper.requireReviewAmount'}
          label={'Require review above'}
          fastField
        >
          <FInputGroup
            name={'bookkeeper.requireReviewAmount'}
            type={'number'}
            fastField
          />
        </FFormGroup>
      </SettingsGrid>

      <SectionTitle>Bookkeeping Policy</SectionTitle>
      <FormGroup label={'Deduction posture'}>
        <FRadioGroup name={'bookkeeper.deductionPosture'} inline>
          <Radio label={'Conservative'} value={'conservative'} />
          <Radio label={'Standard'} value={'standard'} />
          <Radio label={'Aggressive'} value={'aggressive'} />
          <Radio label={'Custom'} value={'custom'} />
        </FRadioGroup>
      </FormGroup>
      <SettingsGrid>
        <FFormGroup
          name={'bookkeeper.greyAreaCategories'}
          label={'Grey-area categories'}
          fastField
        >
          <FInputGroup name={'bookkeeper.greyAreaCategories'} fastField />
        </FFormGroup>
        <FFormGroup
          name={'bookkeeper.annualAutoExpenseTarget'}
          label={'Annual auto expense target'}
          fastField
        >
          <FInputGroup
            name={'bookkeeper.annualAutoExpenseTarget'}
            type={'number'}
            fastField
          />
        </FFormGroup>
        <FFormGroup
          name={'bookkeeper.monthlyAutoExpenseTarget'}
          label={'Monthly auto expense target'}
          fastField
        >
          <FInputGroup
            name={'bookkeeper.monthlyAutoExpenseTarget'}
            type={'number'}
            fastField
          />
        </FFormGroup>
      </SettingsGrid>

      <SectionTitle>Learning And Integrations</SectionTitle>
      <FormGroup>
        <FFormGroup name={'bookkeeper.interviewEnabled'} inline>
          <FCheckbox
            inline
            label={'Run owner interview and follow-up questions'}
            name={'bookkeeper.interviewEnabled'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.chatEnabled'} inline>
          <FCheckbox
            inline
            label={'Enable policy chat'}
            name={'bookkeeper.chatEnabled'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.autoCreateRules'} inline>
          <FCheckbox
            inline
            label={'Create durable rules from confirmed patterns'}
            name={'bookkeeper.autoCreateRules'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.autoCreateExpenseAccounts'} inline>
          <FCheckbox
            inline
            label={'Create missing expense accounts from stable taxonomy gaps'}
            name={'bookkeeper.autoCreateExpenseAccounts'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.amazonParserEnabled'} inline>
          <FCheckbox
            inline
            label={
              'Use Amazon order parser when transaction detail is ambiguous'
            }
            name={'bookkeeper.amazonParserEnabled'}
          />
        </FFormGroup>
        <FFormGroup name={'bookkeeper.taxToolsEnabled'} inline>
          <FCheckbox
            inline
            label={'Enable tax prep checklist and workbook parser hooks'}
            name={'bookkeeper.taxToolsEnabled'}
          />
        </FFormGroup>
      </FormGroup>

      <FFormGroup
        name={'bookkeeper.interviewContext'}
        label={'Known business context'}
        fastField
      >
        <FTextArea
          name={'bookkeeper.interviewContext'}
          growVertically
          large
          fill
          fastField
        />
      </FFormGroup>

      <CardFooterActions>
        <Button intent={Intent.PRIMARY} loading={isSubmitting} type="submit">
          Save
        </Button>
        <Button disabled={isSubmitting} onClick={handleCloseClick}>
          Close
        </Button>
      </CardFooterActions>
    </Form>
  );
}

const SectionTitle = styled.h3`
  color: #1f2933;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 14px;

  &:not(:first-child) {
    margin-top: 28px;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  column-gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
