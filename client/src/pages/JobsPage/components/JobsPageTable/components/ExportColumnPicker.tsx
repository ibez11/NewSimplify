import React, { FC, useEffect, useState } from 'react';
import {
  Popper,
  Fade,
  Paper,
  Grid,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Button,
  makeStyles,
  Theme,
  Typography,
  FormControlLabel
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import axios from 'axios';
import { GET_SETTING_CODE_BASE_URL, GET_SETTING_UPDATE_BASE_URL } from 'constants/url';

interface ExportColumnPickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onExport: (selected: { label: string; key: string }[]) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    width: 520,
    zIndex: 99
  },
  paper: {
    borderRadius: '5px',
    padding: theme.spacing(2),
    maxHeight: 600,
    overflow: 'hidden'
  },
  listItem: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(-1),
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  checkBoxSize: {
    fontSize: 18
  }
}));

const ExportColumnPicker: FC<ExportColumnPickerProps> = ({ open, anchorEl, setOpen, onExport }) => {
  const classes = useStyles();
  const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const columns = [
    { label: 'Job ID', key: 'jobId' },
    { label: 'Client', key: 'clientName' },
    { label: 'Contact Person', key: 'contactPerson' },
    { label: 'Contact Number', key: 'contactNumber' },
    { label: 'Contact Email', key: 'contactEmail' },
    { label: 'Quotation Title', key: 'serviceName' },
    { label: 'Service Address', key: 'serviceAddress' },
    { label: 'Billing Address', key: 'billingAddress' },
    { label: 'Type', key: 'serviceType' },
    { label: 'Job Status', key: 'jobStatus' },
    { label: 'Start Time', key: 'startTime' },
    { label: 'End Time', key: 'endTime' },
    { label: 'Actual Start', key: 'actualStartTime' },
    { label: 'Actual End', key: 'actualEndTime' },
    { label: 'Actual Duration (mins)', key: 'actualDuration' },
    { label: 'Vehicle', key: 'assignedVehicle' },
    { label: 'Employee', key: 'assignedEmployee' },
    { label: 'Invoice Number', key: 'invoiceNumber' },
    { label: 'Invoice Status', key: 'invoiceStatus' },
    { label: 'Additional Invoice Number', key: 'additionalInvoiceNumber' },
    { label: 'Additional Invoice Status', key: 'additionalInvoiceStatus' },
    { label: 'Quotation Amount', key: 'totalServiceAmount' },
    { label: 'Total Completed Job', key: 'totalCompletedJobs' },
    { label: 'Number of Job Quotation', key: 'totalJob' },
    { label: 'Job Amount', key: 'jobAmount' },
    { label: 'Job GST Amount', key: 'jobGstAmount' },
    { label: 'Job Discount Amount', key: 'jobDiscountAmount' },
    { label: 'Total Job Amount', key: 'totalJobAmount' },
    { label: 'Additional Service Item', key: 'totalAdditionalAmountBeforeGst' },
    { label: 'Additional GST Amount', key: 'additionalGstAmount' },
    { label: 'Total Additional Amount', key: 'totalAdditionalAmount' },
    { label: 'Total Amount', key: 'totalJobAndAdditionalAmount' },
    { label: 'Job Collected Amount', key: 'collectedAmount' },
    { label: 'Additional Collected Amount', key: 'additionalCollectedAmount' },
    { label: 'Payment Method', key: 'paymentMethod' },
    { label: 'Service Items Name', key: 'serviceItems' },
    { label: 'Service Items Description', key: 'serviceItemsDescription' },
    { label: 'Service Items Qty', key: 'serviceItemsQty' },
    { label: 'Service Items Price', key: 'serviceItemsPrice' },
    { label: 'Additional Service Items Name', key: 'additionalServiceItems' },
    { label: 'Additional Service Items Description', key: 'additionalServiceItemsDescription' },
    { label: 'Additional Service Items Qty', key: 'additionalServiceItemsQty' },
    { label: 'Additional Service Items Price', key: 'additionalServiceItemsPrice' },
    { label: 'Expenses Item', key: 'expensesItems' },
    { label: 'Sales Person', key: 'salesPerson' },
    { label: 'Client Agent', key: 'agentName' },
    { label: 'Entity', key: 'entityName' },
    { label: 'Custom Field Label 1', key: 'customFieldLabel1' },
    { label: 'Custom Field Value 1', key: 'customFieldValue1' },
    { label: 'Custom Field Label 2', key: 'customFieldLabel2' },
    { label: 'Custom Field Value 2', key: 'customFieldValue2' }
  ];

  const half = Math.ceil(columns.length / 2);
  const left = columns.slice(0, half);
  const right = columns.slice(half);

  const allSelected = columns.length > 0 && columns.every(c => !!selectedKeys[c.key]);
  const someSelected = columns.some(c => !!selectedKeys[c.key]);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys({});
    } else {
      const map: Record<string, boolean> = {};
      columns.forEach(c => {
        map[c.key] = true;
      });
      setSelectedKeys(map);
    }
  };

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(GET_SETTING_CODE_BASE_URL('JOBEXPORTFIELDS'));
        const val = data?.value;
        let parsed: any = null;
        if (!val) parsed = null;
        else if (typeof val === 'string') {
          try {
            parsed = JSON.parse(val);
          } catch {
            parsed = String(val)
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
              .map(k => ({ key: k }));
          }
        } else {
          parsed = val;
        }

        if (Array.isArray(parsed)) {
          const map: Record<string, boolean> = {};
          parsed.forEach((p: any) => {
            if (p && (p.key || p.key === 0)) map[String(p.key)] = true;
          });
          setSelectedKeys(map);
        }
      } catch (err) {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, [open]);

  const handleToggle = (key: string) => () => {
    setSelectedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCancel = () => setOpen(false);

  const handleExportClick = async () => {
    const selected = columns.filter(c => selectedKeys[c.key]).map(c => ({ label: c.label, key: c.key }));
    try {
      await axios.put(GET_SETTING_UPDATE_BASE_URL(33), { value: JSON.stringify(selected), isActive: true });
    } catch (err) {
      // ignore save error
    }
    setOpen(false);
    onExport(selected);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement={'top'} className={classes.popper} transition disablePortal>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Grid container alignItems='center' justify='space-between'>
                  <Grid item>
                    <Typography variant='h6'>Choose Export Data</Typography>
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox color='primary' checked={allSelected} indeterminate={!allSelected && someSelected} onChange={handleSelectAll} />
                      }
                      label='Select All'
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      <List>
                        {left.map(col => (
                          <ListItem key={col.key} dense button disableRipple className={classes.listItem} onClick={handleToggle(col.key)}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxSize} />}
                              checkedIcon={<CheckBoxIcon className={classes.checkBoxSize} />}
                              edge='start'
                              color='primary'
                              checked={!!selectedKeys[col.key]}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText primary={col.label} />
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </Grid>
                  <Grid item xs={6}>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      <List>
                        {right.map(col => (
                          <ListItem key={col.key} dense button disableRipple className={classes.listItem} onClick={handleToggle(col.key)}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxSize} />}
                              checkedIcon={<CheckBoxIcon className={classes.checkBoxSize} />}
                              edge='start'
                              color='primary'
                              checked={!!selectedKeys[col.key]}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText primary={col.label} />
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} container spacing={2} justify='flex-end'>
                <Grid item>
                  <Button variant='text' onClick={handleCancel}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant='contained' disableElevation color='primary' onClick={handleExportClick} disabled={loading}>
                    Export
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default ExportColumnPicker;
