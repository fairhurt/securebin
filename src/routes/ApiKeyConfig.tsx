import React, { useEffect, useLayoutEffect } from 'react';
import {
  Box,
  Card,
  DialogContent,
  Divider,
  InputBase,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AppContext } from '../contexts/AppContext';
import { CheckCircle, Error } from '@mui/icons-material';
import { isValidDevKey } from '../chrome/utils/pastebin';
import { Action, PASTEBIN_API_KEY_LENGTH } from '../constants';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  copybox: {
    padding: '7px 0 7px 10px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
  margin: {
    marginTop: 10,
  },
  green: {
    color: 'green',
  },
  red: {
    color: 'red',
  },
  icon: {
    fontSize: '14px',
  },
}));

export function StatusBanner(props: any) {
  const classes = useStyles();

  return (
    // <Card classes={{ root: classes.card }}>
    <ListItem
      sx={{
        padding: 0,
        margin: 0,
        fontSize: 12,
        fontWeight: 500,
        minWidth: 0,
        width: 'auto',
      }}
    >
      <ListItemIcon sx={{ minWidth: '18px' }}>
        {props.success ? (
          <CheckCircle className={clsx(classes.green, classes.icon)} />
        ) : (
          <Error className={clsx(classes.red, classes.icon)} />
        )}
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{
          color: props.success ? 'green' : 'red',
          fontSize: '14px',
        }}
        primary={
          props.success ? 'Verified by Pastebin' : 'Rejected by Pastebin'
        }
      />
    </ListItem>
    // </Card>
  );
}

const EncryptionConfig = () => {
  const classes = useStyles();
  const { state, dispatch } = React.useContext(AppContext);
  const { api_key } = state.settings;
  const [apiKey, setApiKey] = React.useState(api_key);
  const [valid, setValid] = React.useState<null | boolean>(null);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const handleSave = () => {
    dispatch({
      type: Action.UPDATE_SETTINGS,
      payload: { ...state.settings, api_key: apiKey },
    });
  };

  const handleApiKeyTest = () => {
    isValidDevKey(apiKey).then(isValid => {
      setValid(isValid);
      handleSave();
    });
  };

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (valid === true || valid === false) {
      setValid(null);
    }

    const id = setTimeout(() => {
      // Execute your command here
      if (apiKey.length === PASTEBIN_API_KEY_LENGTH) {
        handleApiKeyTest();
      }
    }, 200);

    setTimeoutId(id);

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(id);
  }, [apiKey, handleApiKeyTest, timeoutId, valid]);

  useLayoutEffect(() => {
    dispatch({
      type: Action.SET_SUBHEADER,
      payload: {
        subheader: {
          back_button: true,
          primary: 'Pastebin API',
          secondary: 'Set API Key',
          custom_button: null,
        },
      },
    });
  }, [dispatch, state.app.location]);

  return (
    <Box>
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant={'h4'}>API Key</Typography>
          {valid === true && apiKey.length === PASTEBIN_API_KEY_LENGTH && (
            <StatusBanner success={true} />
          )}
          {valid === false && apiKey.length === PASTEBIN_API_KEY_LENGTH && (
            <StatusBanner success={false} />
          )}
        </Box>
        <Card className={classes.copybox}>
          <InputBase
            autoFocus
            defaultValue={api_key}
            placeholder={'2e58ce27239e34a77c5ef65dbea8b24d'}
            fullWidth
            sx={{
              fontFamily: 'Menlo, monospace',
              fontSize: 16,
              letterSpacing: '-0.1px',
              fontWeight: 700,
            }}
            onChange={event => {
              setApiKey(event.target.value);
            }}
          />
        </Card>
      </DialogContent>
      <Divider />
      <DialogContent
        sx={{
          height: '200px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
          scrollBehavior: 'smooth',
          transform: 'translateZ(0)',
        }}
      >
        <Typography variant={'h3'}>Get Started with PasteBin API</Typography>
        <br />
        <Typography variant={'h4'}>Sign Up for a Pastebin Account</Typography>
        <Typography variant={'body2'}>
          To use the PasteBin API, you first need an account. Sign up{' '}
          <a
            href="https://pastebin.com/signup"
            onClick={() => window.open('https://pastebin.com/signup')}
          >
            here
          </a>
          .
        </Typography>

        <Typography variant={'h4'}>Access Your API Key</Typography>
        <Typography variant={'body2'} className={classes.margin}>
          Once you have an account, your API key can be found in the API
          documentation section. Access it{' '}
          <a
            href="https://pastebin.com/doc_api"
            onClick={() => window.open('https://pastebin.com/doc_api')}
          >
            here
          </a>
        </Typography>
      </DialogContent>
    </Box>
  );
};

export default EncryptionConfig;
