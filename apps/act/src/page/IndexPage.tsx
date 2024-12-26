import Box from '@mui/material/Box';

import Header from '@/components/Header';

const IndexPage = () => {
  return (
    <>
      <Header />
      <Box
        component="main"
        className="flex items-center justify-center"
        sx={theme => ({ height: `calc(100dvh - ${theme.spacing(8)})` })}
      ></Box>
    </>
  );
};

export default IndexPage;
