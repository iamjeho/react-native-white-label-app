// @flow
import { Platform } from 'react-native'

import {
  ANDROID_EULA_LOCAL,
  ANDROID_EULA_URL,
  IOS_EULA_LOCAL,
  IOS_EULA_URL,
  // $FlowExpectedError[cannot-resolve-module] external file
} from '../../../../../app/evernym-sdk/eula'

const isAndroid = Platform.OS === 'android'
export const EULA_ACCEPT = 'EULA_ACCEPT'
export const SHARE_EULA = 'SHARE_EULA'
const androidEulaUrl =  ANDROID_EULA_URL || 'https://www.connect.me/google.html'
const iosEulaUrl =  IOS_EULA_URL || 'https://www.connect.me/ios_eula.html'
export const EULA_URL = isAndroid ? androidEulaUrl : iosEulaUrl
export const localEulaSource = isAndroid ? ANDROID_EULA_LOCAL : IOS_EULA_LOCAL
export const STORAGE_KEY_EULA_ACCEPTANCE = 'STORAGE_KEY_EULA_ACCEPTANCE'
export const HYDRATE_EULA_ACCEPT = 'HYDRATE_EULA_ACCEPT'

export type EulaStore = {
  isEulaAccept: boolean,
}

export type EulaActions = EulaAccept | HydrateEulaAcceptAction

export type EulaAccept = {
  type: typeof EULA_ACCEPT,
  isEulaAccept: boolean,
}

export type ShareEula = {
  type: typeof SHARE_EULA,
  uri: string,
}

export type HydrateEulaAcceptAction = {
  type: typeof HYDRATE_EULA_ACCEPT,
  isEulaAccept: boolean,
}

export const title = 'END USER LICENSE AGREEMENT'