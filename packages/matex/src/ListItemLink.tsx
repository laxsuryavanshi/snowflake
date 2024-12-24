import { forwardRef } from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton';

const ListItemLink = forwardRef<
  HTMLAnchorElement | null,
  Omit<ListItemButtonProps<'a', { href: string }>, 'selected'>
>((props, ref) => {
  const { href, ...other } = props;
  const { pathname: path } = useResolvedPath(href);
  const match = useMatch({ path, end: true });

  return <ListItemButton selected={!!match} ref={ref} href={href} {...other} />;
});

ListItemLink.displayName = 'ListItemLink';

export default ListItemLink;
