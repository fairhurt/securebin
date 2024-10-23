import { copyTextClipboard } from '../chrome/utils';
import { encrypt, decrypt } from '../chrome/utils/crypto';
import { postPastebin, getPastebin } from '../chrome/utils/pastebin';
import {
  getSyncItemAsync,
  addLocalItem,
  setSyncItem,
} from '../chrome/utils/storage';
import {
  Storage,
  MAX_PASTEBIN_TEXT_LENGTH,
  MAX_ENC_TEXT_LENGTH,
} from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { SettingsType } from '../contexts/AppContext';

/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener(async details => {
  console.log('onInstall, checking for settings, else set defaults', details);
  const mode = (await getSyncItemAsync(Storage.ENC_MODE)) as string;
  if (mode === undefined) {
    console.log('Mode = ', 'AES-GCM');
    setSyncItem(Storage.ENC_MODE, 'AES-GCM');
  }

  const len = (await getSyncItemAsync(Storage.KEY_LENGTH)) as number;
  if (len === undefined) {
    console.log('Key_Len = ', 128);
    setSyncItem(Storage.KEY_LENGTH, 16);
  }

  const theme = (await getSyncItemAsync(Storage.THEME)) as number;
  if (theme === undefined) {
    console.log('Theme = ', 'Light');
    setSyncItem(Storage.THEME, false);
  }
  //console.log(mode, len, theme);
});

chrome.runtime.onConnect.addListener(port => {
  //console.log('[background.js] onConnect', port)
});

chrome.runtime.onStartup.addListener(() => {
  // console.log('[background.js] onStartup')
});

/**
 *  Sent to the event page just before it is unloaded.
 *  This gives the extension opportunity to do some clean up.
 *  Note that since the page is unloading,
 *  any asynchronous operations started while handling this event
 *  are not guaranteed to complete.
 *  If more activity for the event page occurs before it gets
 *  unloaded the onSuspendCanceled event will
 *  be sent and the page won't be unloaded. */
chrome.runtime.onSuspend.addListener(() => {
  // console.log('[background.js] onSuspend')
});

// storage changed
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//       console.log(
//         `Storage key "${key}" in namespace "${namespace}" changed.`,
//         `Old value was "${oldValue}", new value is "${newValue}".`
//       );
//     }
//   });

const pasteBinMenuItem = {
  id: 'pasteBin',
  title: 'Share via PasteBin',
  contexts: ['selection'],
};

const clipboardMenuItem = {
  id: 'clipboardMenuItem',
  title: 'Encrypt to Clipboard',
  contexts: ['selection'],
};
const decryptMenuItem = {
  id: 'decryptText',
  title: 'Decrypt Text',
  contexts: ['selection'],
};

chrome.contextMenus.create(pasteBinMenuItem);
chrome.contextMenus.create(clipboardMenuItem);
chrome.contextMenus.create(decryptMenuItem);

chrome.contextMenus.onClicked.addListener(async clickData => {
  let text = clickData.selectionText;
  if (text === undefined) {
    alert('Please select some text');
    return;
  }

  if (clickData.menuItemId === 'pasteBin') {
    if (text.length > MAX_PASTEBIN_TEXT_LENGTH) {
      alert('Can only encrypt up to ' + MAX_ENC_TEXT_LENGTH + ' characters');
      return;
    }

    const { enc_mode, encryption, key_length, api_key } =
      (await getSyncItemAsync(Storage.SETTINGS)) as SettingsType;
    const res = await encrypt(text);
    console.log('ENC text', enc_mode, encryption, key_length, api_key);
    const link = await postPastebin(
      res.data,
      'LxmOdiaiwoCXmuwWvUqkhliMcp0LjHP-'
    ); // TODO change this
    const history = {
      id: uuidv4(),
      pastebinlink: `${enc_mode}-${encryption}-${key_length}-${api_key}`,
      enc_text: `${enc_mode}-${encryption}-${key_length}-${api_key}`, //encryption ? res.data : text,
      enc_mode: enc_mode,
      key_length: key_length,
      date: Date(),
    };
    addLocalItem(Storage.HISTORY, history);

    alert('Key: ' + res.key + '\nLink:' + link);
    copyTextClipboard('Key: ' + res.key + '\nLink:' + link);
  } else if (clickData.menuItemId === 'clipboardMenuItem') {
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      alert('Can only encrypt up to ' + MAX_ENC_TEXT_LENGTH + ' characters');
      return;
    }
    const res = await encrypt(text);
    const mode = (await getSyncItemAsync(Storage.ENC_MODE)) as string;
    const len = (await getSyncItemAsync(Storage.KEY_LENGTH)) as number;
    //console.log("ENC text", res.data)

    const history = {
      id: uuidv4(),
      pastebinlink: '',
      enc_text: res.data,
      enc_mode: mode,
      key_length: len,
      date: Date(),
    };

    //console.log("ENC text", history)
    addLocalItem(Storage.HISTORY, history);

    alert('Key: ' + res.key + '\nCiphertext:' + res.data);
    copyTextClipboard('Key: ' + res.key + '\nCiphertext:' + res.data);
  } else if (clickData.menuItemId === 'decryptText') {
    if (text.length > MAX_ENC_TEXT_LENGTH) {
      alert('Can only decrypt up to ' + MAX_ENC_TEXT_LENGTH + ' characters');
      return;
    }

    if (text.length > MAX_PASTEBIN_TEXT_LENGTH) {
      alert('PasteBin only supports up to 512 Characters of text');
      return;
    }
    const key = prompt('Please enter your key');
    if (key === null) {
      return;
    } else if (text.includes('C_TXT')) {
      const res = decrypt(text, key);
      alert('Decrypted text: \n' + res);
      //console.log(res);
    } else if (text.includes('pastebin')) {
      const link = text;
      text = await getPastebin(link);
      const res = decrypt(text, key);
      alert('Decrypted text: \n' + res);
      //console.log(res);
    } else {
      console.log('Invalid Text');
    }
  }
});
