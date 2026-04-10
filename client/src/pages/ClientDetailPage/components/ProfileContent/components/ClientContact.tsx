import React, { FC, useState, useEffect, Fragment } from 'react';
import { Button, Card, CardHeader, CardContent, Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import Skeleton from 'react-loading-skeleton';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  clients: ClientDetailsModel;
  isLoading: boolean;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
  setEditType: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  CardContent: { padding: 0, maxHeight: 500, flexGrow: 1, overflowY: 'scroll', overflowX: 'hidden' },
  grid: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  divider: { margin: theme.spacing(2), marginBottom: theme.spacing(1) }
}));

const ClientContact: FC<Props> = props => {
  const classes = useStyles();
  const { clients, isLoading, setOpenForm, setEditType } = props;

  const [clientContactPerson, setClientContactPerson] = useState<string>('');
  const [clientContactEmail, setClientContactEmail] = useState<string>('');
  const [clientCountryCode, setClientCountryCode] = useState<string>('');
  const [clientContactNumber, setClientContactNumber] = useState<string>('');
  const [clientDescription, setClientDescription] = useState<string>('');
  const [additionalContactPersons, setAdditionalContactPersons] = useState<ContactPersonModel[]>([]);

  useEffect(() => {
    const { ContactPersons } = clients!;

    if (!ContactPersons) {
      return;
    }

    const additionalContactPersons = ContactPersons.filter(item => !item.isMain);

    setClientContactPerson(ContactPersons[0].contactPerson);
    setClientContactEmail(ContactPersons[0].contactEmail);
    setClientCountryCode(ContactPersons[0].countryCode);
    setClientContactNumber(ContactPersons[0].contactNumber);
    setClientDescription(ContactPersons[0].description || '');
    setAdditionalContactPersons(additionalContactPersons || []);
  }, [clients]);

  const handleOpenEditContact = () => {
    setOpenForm(true);
    setEditType('contact');
  };

  return (
    <Grid item xs={4}>
      <Card variant='outlined' className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Grid container alignItems='center'>
              <Grid item xs={12} md={7}>
                <Typography variant='h4'>Contact Details</Typography>
              </Grid>
              <Grid item container xs={12} md={5} justify='flex-end'>
                <Button color='primary' disableElevation startIcon={<EditIcon />} onClick={handleOpenEditContact}>
                  Edit Contact
                </Button>
              </Grid>
            </Grid>
          }
        />
        <Divider />
        <CardContent className={classes.CardContent}>
          <Grid container spacing={2} className={classes.grid}>
            <Grid item xs={12}>
              <Typography variant='h5' gutterBottom>
                Contact Person 1
              </Typography>
            </Grid>
            <Grid item container spacing={1} xs={12}>
              <Grid item xs={12} md={4}>
                <Typography variant='body1' color='textSecondary' gutterBottom>
                  Name & Description
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {isLoading ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='subtitle2'>{`${clientContactPerson} ${clientDescription ? `(${clientDescription})` : ''}`}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant='body1' color='textSecondary' gutterBottom>
                  Phone Number
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {isLoading ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='subtitle2'>
                    {clientCountryCode}
                    {clientContactNumber}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant='body1' color='textSecondary' gutterBottom>
                  Email
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {isLoading ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='subtitle2'>
                    {isLoading ? (
                      <Skeleton width={'80%'} />
                    ) : (
                      <Typography variant='subtitle2'>{clientContactEmail ? clientContactEmail : '-'}</Typography>
                    )}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
          {!isLoading &&
            additionalContactPersons &&
            additionalContactPersons.length > 0 &&
            additionalContactPersons.map((value, index) => {
              return (
                <Fragment key={`contact-${index}`}>
                  {index !== additionalContactPersons.length && <Divider className={classes.divider} />}
                  <Grid container spacing={2} className={classes.grid}>
                    <Grid item xs={12}>
                      <Typography variant='h5' gutterBottom>
                        Contact Person {index + 2}
                      </Typography>
                    </Grid>
                    <Grid item container spacing={1} xs={12}>
                      <Grid item xs={12} md={4}>
                        <Typography variant='body1' color='textSecondary' gutterBottom>
                          Name & Description
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        {isLoading ? (
                          <Skeleton width={'80%'} />
                        ) : (
                          <Typography variant='subtitle2'>{`${value.contactPerson} ${value.description ? `(${value.description})` : ''}`}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant='body1' color='textSecondary' gutterBottom>
                          Phone Number
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        {isLoading ? (
                          <Skeleton width={'80%'} />
                        ) : (
                          <Typography variant='subtitle2'>
                            {value.countryCode}
                            {value.contactNumber}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant='body1' color='textSecondary' gutterBottom>
                          Email
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        {isLoading ? (
                          <Skeleton width={'80%'} />
                        ) : (
                          <Typography variant='subtitle2'>
                            {isLoading ? (
                              <Skeleton width={'80%'} />
                            ) : (
                              <Typography variant='subtitle2'>{value.contactEmail ? value.contactEmail : '-'}</Typography>
                            )}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Fragment>
              );
            })}
        </CardContent>
      </Card>
    </Grid>
  );
};
export default ClientContact;
