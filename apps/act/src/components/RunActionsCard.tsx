import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import github, { Branch, Repo } from '@/services/github';

const submitWorkflowRun = async (repo: Repo, branch: Branch) => {
  return await fetch('http://localhost:8080/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repo: repo.clone_url, branch: branch.name }),
  });
};

const RunActionsCard = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    void github.getRepos().then(repos => {
      setRepos(repos);
    });
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      void github.getBranches(selectedRepo.owner.login, selectedRepo.name).then(branches => {
        setBranches(branches);
      });
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (!selectedRepo) {
      setSelectedBranch(null);
    }
  }, [selectedRepo]);

  const handleRepoChange = (_: React.SyntheticEvent, value: Repo | null) => {
    setSelectedRepo(value);
  };

  const handleBranchChange = (_: React.SyntheticEvent, value: Branch | null) => {
    setSelectedBranch(value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRepo || !selectedBranch) {
      return;
    }

    try {
      void submitWorkflowRun(selectedRepo, selectedBranch)
        .then(res => res.json())
        .then(({ id }) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          const source = new EventSource(`http://localhost:8080/events?stream=${id}`);
          source.onmessage = event => {
            // eslint-disable-next-line no-console
            console.log(event.data);
          };
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <Card variant="outlined" sx={{ width: 520 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Run Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Autocomplete
            autoHighlight
            fullWidth
            clearIcon={null}
            options={repos}
            getOptionLabel={repo => repo.name}
            value={selectedRepo}
            onChange={handleRepoChange}
            renderInput={params => (
              <TextField {...params} variant="outlined" label="Repository" required />
            )}
          />
          <Autocomplete
            autoHighlight
            fullWidth
            clearIcon={null}
            options={branches}
            getOptionLabel={branch => branch.name}
            value={selectedBranch}
            onChange={handleBranchChange}
            renderInput={params => (
              <TextField {...params} variant="outlined" label="Branch" required />
            )}
          />

          <Button type="submit" variant="contained" color="primary" disableElevation fullWidth>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RunActionsCard;
