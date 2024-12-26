import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

import Header from '@/components/Header';
import RunActionsCard from '@/components/RunActionsCard';
import github, { User } from '@/services/github';

const IndexPage = () => {
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    void github.getUser().then(user => {
      setUser(user);
    });
  }, []);

  return (
    <>
      <Header user={user} />
      <Box
        component="main"
        className="flex items-center justify-center"
        sx={theme => ({ height: `calc(100dvh - ${theme.spacing(8)})` })}
      >
        <RunActionsCard />
      </Box>
    </>
  );
};

export default IndexPage;
