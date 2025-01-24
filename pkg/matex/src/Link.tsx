import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router';

export type LinkProps = Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] };

/**
 * @see https://mui.com/material-ui/integrations/routing/#global-theme-link
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, ...other } = props;
  // Map href (Material UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

Link.displayName = 'Link';

export default Link;
