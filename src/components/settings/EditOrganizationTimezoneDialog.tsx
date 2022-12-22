import { forwardRef } from 'react'
import { useFormik } from 'formik'
import { gql } from '@apollo/client'
import { object, string } from 'yup'
import styled from 'styled-components'

import { Button, Dialog, DialogRef } from '~/components/designSystem'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { ComboBoxField } from '~/components/form'
import { TimezoneEnum, useUpdateOrganizationTimezoneMutation } from '~/generated/graphql'
import { addToast, updateOrganizationTimezone } from '~/core/apolloClient'
import { theme } from '~/styles'
import { useOrganizationTimezone } from '~/hooks/useOrganizationTimezone'
import { getTimezoneConfig } from '~/core/timezone'

gql`
  mutation updateOrganizationTimezone($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      timezone
    }
  }
`

export interface EditOrganizationTimezoneDialogRef extends DialogRef {}

export const EditOrganizationTimezoneDialog = forwardRef<EditOrganizationTimezoneDialogRef>(
  (_, ref) => {
    const { translate } = useInternationalization()
    const { timezone } = useOrganizationTimezone()
    const [update] = useUpdateOrganizationTimezoneMutation({
      onCompleted(res) {
        if (res?.updateOrganization) {
          updateOrganizationTimezone(res?.updateOrganization.timezone as TimezoneEnum)
          addToast({
            severity: 'success',
            translateKey: 'text_63891ad3dd238c657ea00954',
          })
        }
      },
    })
    const formikProps = useFormik({
      initialValues: {
        timezone,
      },
      validationSchema: object().shape({
        timezone: string().required(''),
      }),
      enableReinitialize: true,
      validateOnMount: true,
      onSubmit: async (values) => {
        await update({
          variables: {
            input: {
              ...values,
            },
          },
        })
      },
    })

    return (
      <Dialog
        ref={ref}
        title={translate('text_63890710eb171a76814a0c0d')}
        description={translate('text_63890710eb171a76814a0c0f')}
        onClickAway={() => {
          formikProps.resetForm()
          formikProps.validateForm()
        }}
        actions={({ closeDialog }) => (
          <>
            <Button
              variant="quaternary"
              onClick={() => {
                closeDialog()
                formikProps.resetForm()
              }}
            >
              {translate('text_63890710eb171a76814a0c15')}
            </Button>
            <Button
              variant="primary"
              disabled={!formikProps.isValid || !formikProps.dirty}
              onClick={async () => {
                await formikProps.submitForm()
                closeDialog()
                formikProps.resetForm()
              }}
            >
              {translate('text_63890710eb171a76814a0c17')}
            </Button>
          </>
        )}
      >
        <Content>
          <ComboBoxField
            name="timezone"
            label={translate('text_63890710eb171a76814a0c11')}
            formikProps={formikProps}
            PopperProps={{ displayInDialog: true }}
            placeholder={translate('text_6390a4ffef9227ba45daca92')}
            data={Object.values(TimezoneEnum).map((timezoneValue) => ({
              value: timezoneValue,
              label: translate('text_638f743fa9a2a9545ee6409a', {
                zone: translate(timezoneValue),
                offset: getTimezoneConfig(timezoneValue).offset,
              }),
            }))}
          />
        </Content>
      </Dialog>
    )
  }
)

const Content = styled.div`
  margin-bottom: ${theme.spacing(8)};
`

EditOrganizationTimezoneDialog.displayName = 'EditOrganizationTimezoneDialog'