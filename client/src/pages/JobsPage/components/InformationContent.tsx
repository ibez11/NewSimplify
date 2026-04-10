import { FC } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import NumberFormat from 'react-number-format';

interface Props {
  jobsInfo: JobInfoModel;
}

const InformationContent: FC<Props> = props => {
  const { jobsInfo } = props;
  const { jobsToday, jobsThisWeek, jobsUnAssignedToday, jobsUnAssignedThisWeek } = jobsInfo;

  const card = (title: string, value: number, secondValue: number, isPrice: boolean) => {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='subtitle2' display='block' gutterBottom>
            {title}
          </Typography>
          <Typography variant='h4' color='secondary' display='block' gutterBottom>
            {isPrice ? <NumberFormat value={value} displayType={'text'} prefix={'$'} thousandSeparator decimalScale={2} fixedDecimalScale /> : value}
          </Typography>
          <Typography variant='body1' color='textSecondary' display='block'>
            {isPrice ? `From ${secondValue} jobs` : `${secondValue} Job Unassigned`}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs>
        {card('Total Jobs Today', jobsToday.count, jobsUnAssignedToday.count, false)}
      </Grid>
      <Grid item xs>
        {card('Total Jobs This Week', jobsThisWeek.count, jobsUnAssignedThisWeek.count, false)}
      </Grid>
      <Grid item xs>
        {card('Total Value Jobs Today', jobsToday.value, jobsToday.count, true)}
      </Grid>
      <Grid item xs>
        {card('Total Value Jobs This Week', jobsThisWeek.value, jobsThisWeek.count, true)}
      </Grid>
    </Grid>
    // <Grid container style={{ marginBottom: 50 }}>
    //   <Grid item xs>
    //     <Paper>
    //       <Grid container>
    //         <Grid container direction='row' justify='space-between' alignItems='center'>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Jobs Today
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 {resultToday}
    //               </Typography>
    //             </Box>
    //           </Grid>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Jobs This Week
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 {resultThisWeek}
    //               </Typography>
    //             </Box>
    //           </Grid>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Unassigned Jobs Today
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 <NumberFormat value={resultUnAssignedToday} displayType={'text'} thousandSeparator={true} fixedDecimalScale={true} />
    //               </Typography>
    //             </Box>
    //           </Grid>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Unassigned Jobs This Week
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 <NumberFormat value={resultUnAssignedThisWeek} displayType={'text'} thousandSeparator={true} fixedDecimalScale={true} />
    //               </Typography>
    //             </Box>
    //           </Grid>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Value Jobs Today
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 <NumberFormat
    //                   value={totalValueToday}
    //                   displayType={'text'}
    //                   thousandSeparator={true}
    //                   prefix={'$'}
    //                   decimalScale={2}
    //                   fixedDecimalScale={true}
    //                 />
    //               </Typography>
    //             </Box>
    //           </Grid>
    //           <Grid item xs={12} sm={2}>
    //             <Box borderRight={1} className={classes.borderColor}>
    //               <Typography variant='subtitle1' display='block'>
    //                 Value Jobs This Week
    //               </Typography>
    //               <Typography variant='h5' color='secondary' display='block'>
    //                 <NumberFormat
    //                   value={totalValueThisWeek}
    //                   displayType={'text'}
    //                   thousandSeparator={true}
    //                   prefix={'$'}
    //                   decimalScale={2}
    //                   fixedDecimalScale={true}
    //                 />
    //               </Typography>
    //             </Box>
    //           </Grid>
    //         </Grid>
    //       </Grid>
    //     </Paper>
    //   </Grid>
    // </Grid>
  );
};

export default InformationContent;
