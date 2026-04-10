import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  makeStyles,
  Theme,
  Typography,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  withStyles,
  createStyles,
  Table,
  TableHead,
  TableBody,
  Paper,
  TableRow,
  TableCell,
  TableContainer,
  TextField
} from '@material-ui/core';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';

import { GET_ACTIVE_VEHICLE_URL, GET_PROXIMITY_TECHNICIAN_URL } from '../constants/url';
import { format } from 'date-fns';
import theme from 'theme';
import CloseIcon from '@material-ui/icons/Close';
import SkillIcon from '@material-ui/icons/Assignment';
import RankIcon from '@material-ui/icons/LocalPlay';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { grey } from '@material-ui/core/colors';
import HeaderRow from './HeaderRow';
import Skeleton from 'react-loading-skeleton';
import SearchInput from './SearchInput';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getUnique } from 'utils';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    minWidth: 720
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  },
  chip: {
    borderRadius: 50,
    marginRight: theme.spacing(1),
    minWidth: 100
  },
  card: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
    width: '100%'
  },
  switches: {
    marginBottom: theme.spacing(1)
  },
  vehicleSelect: {
    minWidth: 240
  },
  tableRowHigh: {
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: '#4CAF50'
  },
  tableRowMedium: {
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: '#FF9800'
  },
  tableRowLow: {
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: '#F44336'
  },
  scoreChip: {
    minWidth: 80,
    height: 28,
    fontWeight: 600
  },
  skillsContainer: {
    display: 'flex',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

interface Technician {
  id: number;
  displayName: string;
  techLocation?: string;
  matchSkills?: string[];
  skillsetScore?: number;
  proximityScore?: number;
  finalScore?: number;
}

interface PageProps {
  open: boolean;
  onClose: () => void;
  job: any;
  onSave?: (data: { technicianIds: number[]; selectedTechnicians: Select[]; selectedVehicles: Select[] }) => void;
  initialSelectedTechnicians?: Select[];
  initialSelectedVehicles?: Select[];
  smartSkill?: boolean;
  smartProximity?: boolean;
  onSmartSkillChange?: (checked: boolean) => void;
  onSmartProximityChange?: (checked: boolean) => void;
  smartSettingId?: number | null;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1)
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#53A0BE',
          opacity: 1,
          border: 'none'
        }
      },
      '&$focusVisible $thumb': {
        color: '#53A0BE',
        border: '6px solid #fff'
      }
    },
    thumb: {
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

const AssignForm: FC<PageProps> = props => {
  const classes = useStyles();
  const {
    open,
    onClose,
    job,
    onSave,
    initialSelectedTechnicians = [],
    initialSelectedVehicles = [],
    smartSkill = true,
    smartProximity = true,
    onSmartSkillChange,
    onSmartProximityChange,
    handleSnackbar
  } = props;
  const { id, jobId, clientName, startDateTime, endDateTime, serviceAddress, postalCode, Skills, ServiceSkills } = job;

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<Select[]>([]);
  const [vehicles, setVehicles] = useState<Select[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>([]);
  const [loadingTech, setLoadingTech] = useState<boolean>(false);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [jobLocation, setJobLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchVehicles();
    // Set initial selected technicians if provided
    if (initialSelectedTechnicians && initialSelectedTechnicians.length > 0) {
      setSelectedTechnicians(initialSelectedTechnicians);
    }
    // Set initial selected vehicles if provided
    if (initialSelectedVehicles && initialSelectedVehicles.length > 0) {
      setSelectedVehicles(initialSelectedVehicles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // refetch technicians when ranking mode changes
    fetchTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, smartSkill, smartProximity]);

  const fetchTechnicians = async () => {
    setLoadingTech(true);
    try {
      const params: any = {};
      if (Skills) params.s = Skills.join(',');
      if (ServiceSkills) params.s = ServiceSkills.map((item: any) => item.skill).join(',');
      if (id | jobId) params.jobId = id | jobId;
      if (postalCode) params.postalCode = postalCode;
      if (smartProximity !== undefined) params.fp = smartProximity;
      if (smartSkill !== undefined) params.fs = smartSkill;

      // Smart ranking endpoint in API
      const { data } = await axios.get(GET_PROXIMITY_TECHNICIAN_URL, { params });
      // Expecting data.technicians array
      const list: Technician[] = (data && data.technicians) || [];
      setTechnicians(list);
      setJobLocation(data.jobLocation || null);
      // Don't clear selectedTechnicians - preserve user's selections
    } catch (err) {
      console.error('failed to fetch smart-ranking technicians', err);
      setTechnicians([]);
      setJobLocation(null);
      handleSnackbar('error', 'Failed to fetch technicians for smart ranking');
    } finally {
      setLoadingTech(false);
    }
  };

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const { data } = await axios.get(GET_ACTIVE_VEHICLE_URL);
      let vehicleData: Select[] = [];
      data.vehicles.map((value: any) => {
        return vehicleData.push({ id: value.id, name: value.carplateNumber });
      });
      setVehicles(vehicleData);
    } catch (err) {
      console.error('failed to fetch vehicles', err);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const toggleSelectTech = (id: number, displayName: string) => {
    setSelectedTechnicians(prev => {
      const exists = prev.find(t => t.id === id);
      if (exists) {
        // Remove if already selected
        return prev.filter(t => t.id !== id);
      } else {
        // Add if not selected
        return [...prev, { id, name: displayName }];
      }
    });
  };

  const handleSetVehicle = (vehicles: Select[]) => {
    const selectedVehicles: any = [];
    if (vehicles) {
      const clearVehicle = getUnique(vehicles, 'id');
      clearVehicle.map(vehicle => {
        return selectedVehicles.push({ id: vehicle.id, name: vehicle.name });
      });
    }

    setSelectedVehicles(selectedVehicles);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        technicianIds: selectedTechnicians.map(t => t.id),
        selectedTechnicians: selectedTechnicians,
        selectedVehicles: selectedVehicles
      });
    }
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const [searchTerm, setSearchTerm] = useState<string>('');

  const displayedTechnicians = technicians.filter(t => {
    if (!searchTerm) return true;
    return (t.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleSkill = (checked: boolean) => {
    if (onSmartSkillChange) {
      onSmartSkillChange(checked);
    }
  };

  const handleToggleProximity = (checked: boolean) => {
    if (onSmartProximityChange) {
      onSmartProximityChange(checked);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth disableBackdropClick>
      <DialogTitle>
        <Typography variant='h5'>Assign Technician & Vehicle</Typography>
        <IconButton size='small' onClick={onClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.content} dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h4' gutterBottom>
              {clientName || '-'}
            </Typography>
            <Typography variant='subtitle1'>{`${format(new Date(startDateTime), 'dd MMM yyyy, HH:mm a')} to ${format(
              new Date(endDateTime),
              'dd MMM yyyy, HH:mm a'
            ) || '-'}`}</Typography>
            <Typography variant='body1'>{serviceAddress || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Chip
              key={`job-location`}
              label={`${jobLocation}`}
              size='small'
              className={classes.chip}
              style={{ color: theme.palette.secondary.main, backgroundColor: theme.palette.secondary.light }}
            />
            {Skills && Skills.length > 0
              ? Skills.map((skill: any, index: number) => (
                  <Chip
                    key={`skill-${index}`}
                    label={`${index + 1}. ${skill}`}
                    size='small'
                    className={classes.chip}
                    style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                  />
                ))
              : null}
            {ServiceSkills && ServiceSkills.length > 0
              ? ServiceSkills.map((skill: any, index: number) => (
                  <Chip
                    key={`skill-${index}`}
                    label={`${index + 1}. ${skill.skill}`}
                    size='small'
                    className={classes.chip}
                    style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                  />
                ))
              : null}
          </Grid>
        </Grid>
        <Card id='scrolled' variant='outlined' className={classes.card}>
          <CardHeader title={<Typography variant='subtitle2'>Assign Technician</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Typography variant='h5'>Skill Match</Typography>
                <Typography variant='body1' color='textSecondary'>
                  Automatically rank technicians based on skill match with the job requirements
                </Typography>
              </Grid>
              <Grid item xs={2} className={classes.switches}>
                <FormControlLabel
                  control={<IOSSwitch checked={smartSkill} onChange={(_, v) => handleToggleSkill(v)} name='smartSkill' color='primary' />}
                  label={smartSkill ? 'Active' : 'Inactive'}
                />
              </Grid>
              <Grid item xs={10}>
                <Typography variant='h5'>Smart Proximity</Typography>
                <Typography variant='body1' color='textSecondary'>
                  Automatically rank technicians based on distance proximity to the job location
                </Typography>
              </Grid>
              <Grid item xs={2} className={classes.switches}>
                <FormControlLabel
                  control={<IOSSwitch checked={smartProximity} onChange={(_, v) => handleToggleProximity(v)} color='primary' />}
                  label={smartProximity ? 'Active' : 'Inactive'}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <SearchInput
                  withBorder
                  withTransition={false}
                  width={200}
                  placeHolder='Search Technician...'
                  iconColor='#989898'
                  tableSearchValue={searchTerm}
                  setTableSearchValue={e => setSearchTerm(e)}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper variant='outlined'>
                  <TableContainer style={{ maxHeight: 360 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <HeaderRow headers={[{ label: 'Technician' }, { label: 'Matched Skill' }, { label: 'Assign' }]} />
                      </TableHead>
                      <TableBody>
                        {loadingTech ? (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              <Skeleton />
                            </TableCell>
                          </TableRow>
                        ) : displayedTechnicians.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              No technicians found
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedTechnicians.map(tech => {
                            const score = tech.finalScore ?? 0;
                            const scoreColor = getScoreColor(score);

                            return (
                              <TableRow key={tech.id}>
                                <TableCell>
                                  <Typography variant='subtitle1' gutterBottom>
                                    {tech.displayName}
                                  </Typography>
                                  <Typography variant='body1' gutterBottom>
                                    {tech.techLocation}
                                  </Typography>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {smartSkill && (
                                      <Typography variant='subtitle1' color='primary' style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <SkillIcon style={{ fontSize: 15, verticalAlign: 'middle' }} />{' '}
                                        {`${tech.matchSkills?.length || 0}/${Skills?.length || ServiceSkills?.length || 0} Skills Matched`}
                                      </Typography>
                                    )}

                                    {smartProximity && (
                                      <Typography variant='subtitle1' style={{ color: scoreColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <RankIcon style={{ fontSize: 15, verticalAlign: 'middle' }} /> {`Score ${Math.round(score)}`}
                                      </Typography>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {smartSkill ? (
                                    tech.matchSkills == null || tech.matchSkills.length === 0 ? (
                                      <Typography variant='body2' color='textSecondary'>
                                        No matched skills
                                      </Typography>
                                    ) : (
                                      <div className={classes.skillsContainer}>
                                        {(tech.matchSkills || []).map((s, idx) => (
                                          <Chip
                                            key={`skill-${idx}`}
                                            label={`${idx + 1}. ${s}`}
                                            size='small'
                                            className={classes.chip}
                                            style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                                          />
                                        ))}
                                      </div>
                                    )
                                  ) : (
                                    <Typography variant='body2' color='textSecondary'>
                                      No Skill Required
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedTechnicians.some(t => t.id === tech.id)}
                                    onChange={() => toggleSelectTech(tech.id, tech.displayName)}
                                    color='primary'
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card id='scrolled' variant='outlined' className={classes.card}>
          <CardHeader title={<Typography variant='subtitle2'>Assign Vehicle</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id='Vehicle'
                  disableCloseOnSelect
                  options={vehicles}
                  getOptionLabel={option => option.name}
                  value={selectedVehicles}
                  getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
                  onChange={(_, value) => handleSetVehicle(value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`${option.name}`}
                        size='small'
                        {...getTagProps({ index })}
                        style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                      />
                    ))
                  }
                  renderOption={(option, { selected }) => (
                    <>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        color='primary'
                        disableRipple
                        className={classes.checkBox}
                        checked={selected}
                      />
                      {option.name}
                    </>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      id='vehicle'
                      label='Vehicle'
                      variant='outlined'
                      autoComplete='off'
                      margin='dense'
                      // error={vehicleError ? true : false}
                      // helperText={vehicleError}
                    />
                  )}
                />

                <div style={{ marginTop: 12 }}>{loadingVehicles && <CircularProgress size={20} />}</div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button variant='contained' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button color='primary' variant='contained' disableElevation onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignForm;
