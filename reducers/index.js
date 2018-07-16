import { combineReducers } from 'redux'

import api from './api'
import accounts from './accounts'
import settings from './settings'
import wallet from './wallet'
import validate from './validate'
import producers from './producers'
import globals from './globals'
import keys from './keys'

const rootReducer = combineReducers({
  api,
  accounts,
  settings,
  wallet,
  validate,
  producers,
  globals,
  keys
})

export default rootReducer