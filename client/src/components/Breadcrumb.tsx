import { FC } from 'react';
import { Breadcrumbs, Link, Typography } from '@material-ui/core';
import useRouter from 'hooks/useRouter';
import { ucWords } from 'utils';

interface Props {
  pages?: string[];
}

const Breadcrumb: FC<Props> = props => {
  const { history } = useRouter();

  const { pages } = props;

  const handleClick = (link: string) => {
    history.push({ pathname: `/${link}` });
  };

  return (
    <Breadcrumbs aria-label='breadcrumb'>
      <Link key={'home'} color='primary' variant='body1' component='button' onClick={() => handleClick('jobs')}>
        Home
      </Link>
      {pages &&
        pages.length > 0 &&
        pages.map((page, index) => {
          if (index === pages.length - 1) {
            return (
              <Typography key={`${page}-${index}`} variant='body1'>
                {ucWords(page)}
              </Typography>
            );
          } else {
            return (
              <Link key={`${page}-${index}`} color='primary' variant='body1' component='button' onClick={() => handleClick(page)}>
                {ucWords(page)}
              </Link>
            );
          }
        })}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
