import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, makeStyles, Paper, Typography, Theme } from '@material-ui/core';
import { DonutChart } from 'bizcharts';

import { format, startOfMonth, endOfMonth } from 'date-fns';
import axios, { CancelTokenSource } from 'axios';
import { ANALYTIC_POPULAR_CONTRACT_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  selectedId: number;
  activeButton: string;
  filterBy: number;
  firstDate: Date | null;
  secondDate: Date | null;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerTitle: {
    margin: theme.spacing(4),
    color: '#7c7c7c',
    textTransform: 'uppercase'
  },
  gridFilter: {
    padding: theme.spacing(2)
  },
  paper: {
    margin: theme.spacing(4)
  },
  dateFieldFont: {
    fontSize: 12,
    marginLeft: -12
  }
}));

const TotalJobHourReport: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { setIsLoadingData, selectedId, activeButton, filterBy, firstDate, secondDate } = props;

  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');

  const [data, setData] = useState<[]>([]);
  const [totalContractType, setTotalContractType] = useState<number>(0);

  const getQueryParams = () => {
    const params = new URLSearchParams();

    if (selectedId !== 0) {
      if (activeButton === 'technician') {
        params.append('tc', selectedId.toString());
      } else {
        params.append('vh', selectedId.toString());
      }
    }

    if (filterBy === 3) {
      params.append('cp', '1');
    } else {
      params.append('cp', '0');
    }

    params.append('sd', format(startOfMonth(firstDate!), 'yyyy-MM-dd'));
    params.append('ed', format(endOfMonth(secondDate!), 'yyyy-MM-dd'));

    return params.toString();
  };

  const fetchData = useCallback(() => {
    setIsLoadingData(true);

    const getPopularItemData = async () => {
      const url = `${ANALYTIC_POPULAR_CONTRACT_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);

      let newPercent: number = 0;
      let newSubtitle: string = '';
      let totalType: number = 0;
      if (data.length > 0) {
        // eslint-disable-next-line array-callback-return
        data.map((value: any) => {
          if (newPercent < value.percent) {
            newPercent = value.percent;
            newSubtitle = value.type;
          }
          totalType = totalType + value.value;
        });
      }
      setTitle(
        data.length > 0
          ? `<h1 style="font-size:50px;margin-bottom:0px;">${newPercent}%</h1>`
          : '<h1 style="font-size:50px;margin-bottom:0px;">No Data</h1>'
      );
      setSubtitle(data.length > 0 ? `<p style="font-size:14px">${newSubtitle}</p>` : '<p style="font-size:18px"></p>');
      setTotalContractType(totalType);

      setIsLoadingData(false);
    };

    getPopularItemData();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDate, secondDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Paper className={classes.paper}>
      <Grid container>
        <Grid item sm={12}>
          <Typography variant='h5' className={classes.headerTitle}>
            Total Job Hours (Not Real Data)
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <DonutChart
          data={data || []}
          autoFit
          height={350}
          radius={0.8}
          angleField='value'
          colorField='type'
          color={['#53a0be', '#F7C137', '#2E5BFF']}
          pieStyle={{ stroke: 'white', lineWidth: 0 }}
          legend={{ position: 'bottom' }}
          statistic={{
            title: {
              customHtml: () => (title ? title : '<h1 style="font-size:50px;margin-bottom:0px;">No Data</h1>')
            },
            content: {
              customHtml: () => (subtitle ? subtitle : '<p style="font-size:18px"></p>')
            }
          }}
          tooltip={{
            formatter: d => {
              return { name: 'Percentage Used', value: `${((d.value / totalContractType) * 100).toFixed(2)}%` };
            },
            title: (title, d) => {
              return d.type;
            },
            showTitle: true
          }}
        />
      </Grid>
    </Paper>
  );
};

export default TotalJobHourReport;
