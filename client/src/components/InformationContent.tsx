import { FC } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';

interface Props {
  isLoading: boolean;
  infomationContents: InformationContentModel[];
}

const InformationContent: FC<Props> = props => {
  const { isLoading, infomationContents } = props;

  const card = (header: string, value: number, isPrice: boolean, subheader?: string) => {
    return (
      <Card variant='outlined'>
        <CardContent>
          {isLoading ? (
            <Skeleton width={'100%'} />
          ) : (
            <Typography variant='subtitle2' display='block' gutterBottom>
              {header}
            </Typography>
          )}
          {isLoading ? (
            <Skeleton width={'100%'} />
          ) : (
            <Typography variant='h4' color='secondary' display='block' gutterBottom>
              {isPrice ? (
                <NumberFormat value={value} displayType={'text'} prefix={'$'} thousandSeparator decimalScale={2} fixedDecimalScale />
              ) : (
                value
              )}
            </Typography>
          )}
          {subheader && (
            <Typography variant='body1' color='textSecondary' display='block'>
              {subheader}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={1}>
      {infomationContents.map(({ header, value, isPrice, subheader }) => (
        <Grid item xs>
          {card(header, value, isPrice, subheader)}
        </Grid>
      ))}
    </Grid>
  );
};

export default InformationContent;
