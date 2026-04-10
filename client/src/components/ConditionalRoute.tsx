import { CurrentUserContext } from 'contexts/CurrentUserContext';
import React, { useContext } from 'react';
import { RouteComponentProps, RouteProps, Redirect, Route } from 'react-router';
import { getCurrentRoleGrants } from 'selectors';
import { hasAccessPermission } from 'utils';

interface Props extends RouteProps {
  routeCondition: boolean;
  redirectTo: string;
  module?: string;
}

const ConditionalRoute: React.FC<Props> = props => {
  const { component: Component, routeCondition, redirectTo, module, ...rest } = props;

  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);

  const renderFn = (renderProps: RouteComponentProps<any>) => {
    if (props.routeCondition) {
      const isPublicRoute = rest.path === '/' || rest.path === '/resetpassword' || rest.path === '/forgotpassword';
      const hasAccess = module ? hasAccessPermission(module!, 'ACCESS', currentRoleGrants) : true;

      if (hasAccess || isPublicRoute) {
        if (!Component) {
          return null;
        }
        return <Component {...renderProps} />;
      } else {
        return <Redirect to={'/notfound'} />;
      }
    }
    return <Redirect to={props.redirectTo} />;
  };

  return (
    // Extract RouteProps without component property to rest.
    <Route {...rest} render={renderFn} />
  );
};

export default ConditionalRoute;
