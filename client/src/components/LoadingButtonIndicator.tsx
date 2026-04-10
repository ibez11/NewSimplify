import { FC } from 'react';
import { ButtonProps } from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Fade } from '@material-ui/core';

interface Props extends ButtonProps {
  isLoading: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const LoadingButtonIndicator: FC<Props> = props => {
  const classes = useStyles();

  // The className and styling defined for LoadingButton will be used to style the root div
  const { isLoading } = props;

  return (
    <>
      {isLoading && (
        <Fade
          in={isLoading}
          style={{
            transitionDelay: '0ms'
          }}
          unmountOnExit
        >
          <CircularProgress size={24} className={classes.buttonProgress} color='primary' />
        </Fade>
      )}
    </>
  );
};

export default LoadingButtonIndicator;
