import * as types from './types';
import { setSetting } from './settings';
import * as Api from '../api/ApiDelegate'

const CryptoJS = require('crypto-js');

export function setWalletKey(key, password) {
  return (dispatch: () => void, getState) => {
    const { settings } = getState();
    return dispatch({
      type: types.SET_WALLET_KEY,
      payload: {
        account: settings.account,
        data: encrypt(key, password),
        key
      }
    });
  };
}

export function setTemporaryKey(key) {
  return (dispatch: () => void, getState) => {
    const { settings } = getState();
    dispatch({
      type: types.SET_TEMPORARY_KEY,
      payload: {
        account: settings.account,
        key
      }
    });
  };
}

export function lockWallet() {
  return (dispatch: () => void) => {
    dispatch({
      type: types.WALLET_LOCK
    });
  };
}

export function removeWallet() {
  return (dispatch: () => void) => {
    dispatch({
      type: types.WALLET_REMOVE
    });
  };
}

export function unlockWallet(wallet, password) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.VALIDATE_WALLET_PASSWORD_PENDING
    });
    const { connection, api } = getState();
    console.log(wallet, password, 'Unlock')
    var key
    try {
      key = decrypt(wallet.data, password).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return dispatch({
        type: types.VALIDATE_WALLET_PASSWORD_FAILURE
      });
    }

    console.log(key, 'DESCRYPTED KEY')
    api.request(connection, Api.IS_VALID_PRIVATE, {key: key})
    .then((valid) => {
      if (valid === true) {
        return dispatch({
          payload: {
            account: wallet.account,
            key
          },
          type: types.VALIDATE_WALLET_PASSWORD_SUCCESS
        });
      }
      return dispatch({
        type: types.VALIDATE_WALLET_PASSWORD_FAILURE
      });
    })
    .catch((error) => {
      return dispatch({
        type: types.VALIDATE_WALLET_PASSWORD_FAILURE
      });
    })
  };
}

export function setWalletMode(walletMode) {
  return (dispatch: () => void) => {
    // Set the wallet mode
    dispatch(setSetting('walletMode', walletMode));
    switch (walletMode) {
      case 'cold': {
        // Remove any connection string we had
        dispatch(setSetting('node', null));
        return dispatch({
          type: types.SET_WALLET_COLD
        });
      }
      case 'watch': {
        return dispatch({
          type: types.SET_WALLET_WATCH
        });
      }
      default: {
        return dispatch({
          type: types.SET_WALLET_HOT
        });
      }
    }
  };
}

function encrypt(msg, pass) {
  const keySize = 256;
  const iterations = 4500;
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(pass, salt, {
    iterations,
    keySize: keySize / 4
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return salt.toString() + iv.toString() + encrypted.toString();
}

function decrypt(transitmessage, pass) {
  const keySize = 256;
  const iterations = 4500;
  const salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  const iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
  const encrypted = transitmessage.substring(64);
  const key = CryptoJS.PBKDF2(pass, salt, {
    iterations,
    keySize: keySize / 4
  });
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return decrypted;
}

export default {
  lockWallet,
  unlockWallet,
  removeWallet,
  setTemporaryKey,
  setWalletKey
};
